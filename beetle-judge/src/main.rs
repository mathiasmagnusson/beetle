use serde_json::json;
use std::{
    io::{self, BufRead, BufReader, Write},
    net::{TcpListener, TcpStream},
};

#[cfg(test)]
mod tests;

mod submission;
mod worker_pool;

use submission::Submission;
use worker_pool::WorkerPool;

fn handle_connection(mut socket: TcpStream, pool: &WorkerPool) {
    let reader = BufReader::new(socket.try_clone().unwrap());

    for line in reader.lines().filter_map(|line| line.ok()) {
        eprintln!("Incoming submission");

        let submission: Submission = match serde_json::from_str(&line) {
            Ok(submission) => submission,
            Err(err) => {
                let _ = write!(socket, "{}\n", json!({ "msg": format!("{}", err) }));
                continue;
            }
        };

        let socket = socket.try_clone().unwrap();
        if let Err(err) = pool.submit(move || {
            submission.judge(socket);
        }) {
            eprintln!("Pool submission error: {:?}", err);
        };
    }
}

fn main() -> io::Result<()> {
    let pool = WorkerPool::new((num_cpus::get() - 1).max(1));

    let listener = TcpListener::bind("127.0.0.1:2929")?;

    while let Ok((socket, addr)) = listener.accept() {
        eprintln!("Incoming connection from {}", addr);
        handle_connection(socket, &pool);
    }

    Ok(())
}
