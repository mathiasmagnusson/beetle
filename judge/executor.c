#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <errno.h>
#include <dirent.h>
#include <string.h>

// build:
	// gcc -O3 -o executor executor.c
	// strip executor
	// sudo chown root:judge-master executor
	// sudo chmod 4750 executor

#define DIRECTORY 1
#define NEW_UID 2
#define PROGRAM_NAME 3
#define REQ_ARGS 3

#define die(...) { fprintf(stderr, __VA_ARGS__); return -1; }

int main(int argc, char** argv) {
	if (argc < 4) die(
		"Syntax: %s <directory> <uid> <program> <args...>\n",
		argv[0]
	);

	if (chdir(argv[DIRECTORY]))
		die("Could not change directory to %s\n", argv[1]);

	if (chroot("."))
		die("Could not set root dir to\n");

	int uid = atoi(argv[NEW_UID]);

	if (uid == 0) die("Refusing to run as root");

	if (setuid(uid))
		die("Could not set uid to %d\n", uid);

	char** child_argv = malloc(
		sizeof (char*) * (argc - REQ_ARGS + 1)
	);
	child_argv[0] = argv[PROGRAM_NAME];
	int i;
	for (i = 1; i < argc - REQ_ARGS; i++) {
		child_argv[i] = malloc(
			sizeof (char) * (strlen(argv[i + REQ_ARGS]) + 1)
		);
		strcpy(child_argv[i], argv[i + REQ_ARGS]);
	}
	child_argv[i] = NULL;

	execve(argv[PROGRAM_NAME], child_argv, 0);
	die("execve returned (failed) errno: %d\n", errno);
}
