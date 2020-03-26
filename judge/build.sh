#!/bin/sh

cargo build --release

gcc -O3 -o executor executor.c
strip executor

docker build -t beetle-judge .
