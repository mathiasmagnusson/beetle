#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <errno.h>
#include <dirent.h>
#include <string.h>

// build:
	// gcc -static -O3 -o executor executor.c
	// strip executor
	// sudo chown root:root executor
	// sudo chmod 4755 executor

#define DIRECTORY 1
#define NEW_UID 2
#define PROGRAM_NAME 3
#define REQ_ARGS 3

int main(int argc, char** argv) {
	if (argc < 4) {
		fprintf(
			stderr,
			"Syntax: %s <directory> <new uid> <program name> <args...>\n",
			argv[0]
		);
		return -1;
	}

	if (setuid(0)) {
		fprintf(stderr, "Could not be root\n");
		return -1;
	}

	if (chdir(argv[DIRECTORY])) {
		fprintf(stderr, "Could not change directory to %s\n", argv[1]);
	}

	if (chroot(".")) {
		char cwd[512];
		if (!getcwd(cwd, 512)) {
			cwd[0] = '?';
			cwd[1] = '\0';
		}
		fprintf(stderr, "Could not set root dir to %s\n", cwd);
		return -1;
	}

	int uid = atoi(argv[NEW_UID]);

	if (setuid(uid)) {
		fprintf(stderr, "Could not set uid to %d\n", uid);
		return -1;
	}

	char** child_argv = malloc(
		sizeof (char*) *
		(argc - REQ_ARGS + 1)
	);
	child_argv[0] = argv[PROGRAM_NAME];
	int i;
	for (i = 1; i < argc - REQ_ARGS; i++) {
		child_argv[i] = malloc(sizeof (char) * (strlen(argv[i + REQ_ARGS]) + 1));
		strcpy(child_argv[i], argv[i + REQ_ARGS]);
	}
	child_argv[i] = NULL;

	int res = execve(argv[PROGRAM_NAME], child_argv, 0);

	fprintf(stderr, "execve returned (failed) errno: %d\n", errno);
	return -1;
}
