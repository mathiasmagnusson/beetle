#include <dirent.h>
#include <errno.h>
#include <sched.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/resource.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <time.h>
#include <unistd.h>

// build:
	// gcc -O3 -o executor executor.c
	// strip executor
	// sudo chown root:judge-master executor
	// sudo chmod 4750 executor

#define die(...) { fprintf(stderr, __VA_ARGS__); return -1; }
#define runtime_error() { return 1; }
#define time_limit_exceeded() { return 2; }
#define memory_limit_exceeded() { return 3; }
#define cpu_too_busy() { return 4; }

#define REQ_ARGS 4

long long timeval_to_ms(struct timeval* t) {
	return
		t->tv_usec / 1000 +
		t->tv_sec  * 1000;
}

/**
 * Gets unfinished childrens' cpu time in milliseconds.
 */
long long get_child_time() {
	struct rusage usage;
	if (getrusage(RUSAGE_CHILDREN, &usage))
		die("Could not get resource usage");

	return
		timeval_to_ms(&usage.ru_utime) +
		timeval_to_ms(&usage.ru_stime);
}

int main(int argc, char** argv) {
	if (argc < REQ_ARGS + 1) die(
		"Syntax: %s <directory> <uid> <program> <time limit> <args...>\n",
		argv[0]
	);

	char* directory    = argv[1];
	char* new_uid_s    = argv[2];
	char* program      = argv[3];
	char* time_limit_s = argv[4];

	if (chdir(directory)) die("Could not change directory to %s\n", directory);

	if (chroot(".")) die("Could not set root dir to\n");

	int new_uid = atoi(new_uid_s);

	if (new_uid == 0) die("Refusing to run as root");

	if (setuid(new_uid)) die("Could not set uid to %d\n", new_uid);

	char** child_argv = malloc(sizeof (char*) * (argc - REQ_ARGS + 1));
	child_argv[0] = program;
	int i;
	for (i = 1; i < argc - REQ_ARGS; i++) {
		child_argv[i] = malloc(
			sizeof (char) * (strlen(argv[i + REQ_ARGS]) + 1)
		);
		strcpy(child_argv[i], argv[i + REQ_ARGS]);
	}
	child_argv[i] = NULL;

	pid_t child_pid = fork();
	if (child_pid == -1) die("Could not fork\n");

	if (child_pid == 0) {
		execve(program, child_argv, NULL);

		die("Could not execute specified program errno: %d\n", errno);
	}

	long long time_limit = atoll(time_limit_s);

	struct timeval start_time; gettimeofday(&start_time, NULL);
	long long start_time_ms = timeval_to_ms(&start_time);

	int status;
	while (true) {
		sched_yield();
		pid_t result = waitpid(child_pid, &status, WNOHANG);
		if (result == child_pid) break;
		if (result != 0) die("Could not check child status\n");

		// sheiße, this doesn't count *unfinished* child processes
		struct timeval current_time; gettimeofday(&current_time, NULL);
		long long current_time_ms = timeval_to_ms(&current_time);

		long long time_passed = current_time_ms - start_time_ms;

		// In case the CPU is busy, we must wait some time extra here
		// TODO: if there is a way to check *unfinished* child processes'
		// CPU time, do that instead.
		if (time_passed > time_limit * 2) {
			kill(child_pid, SIGKILL);
			time_limit_exceeded();
		}
	}

	if (!WIFEXITED(status) || WEXITSTATUS(status) != 0) runtime_error();

	long long time_used = get_child_time();

	if (time_used > time_limit) time_limit_exceeded();

	fprintf(stderr, "time used: %lld\n", time_used);

	return 0;
}
