#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/types.h>
#include <errno.h>
#include <dirent.h>

// Binary must have the following stuff on `ls -l`: `-rwsr-xr-x 1 root root`

int main(int argc, char** argv) {
	if (argc != 3) {
		fprintf(stderr, "Syntax: %s <program name> <new uid>\n", argv[0]);
		return -1;
	}

	if (setuid(0)) {
		fprintf(stderr, "Could not be root\n");
		return -1;
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

	int uid = atoi(argv[2]);

	if (setuid(uid)) {
		fprintf(stderr, "Could not set uid to %d\n", uid);
		return -1;
	}

	char* child_argv[2];
	child_argv[0] = argv[1];
	child_argv[1] = NULL;
	int res = execve(argv[1], child_argv, 0);

	fprintf(stderr, "execve returned (failed) errno: %d\n", errno);
}
