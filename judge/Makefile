beetle-judge:
	cargo build --release
	mv target/release/$@ ./

executor: executor.c
	gcc -O3 -o $@ $^

build: executor
	sudo chown root:$$(id -u) $^
	sudo chmod 4750 $^

clean:
	rm -f executor

.PHONY: build clean
