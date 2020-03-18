use serde_json::json;
use std::error::Error;
use std::io::{BufRead, BufReader, Write};
use std::net::{TcpListener, TcpStream};
use std::sync::RwLock;

use lazy_static::lazy_static;

#[cfg(test)]
mod tests;

mod sandbox;
mod settings;
mod submission;
mod worker_pool;

use sandbox::Sandbox;
use settings::Settings;
use submission::Submission;
use worker_pool::WorkerPool;

lazy_static! {
    static ref SETTINGS: RwLock<Settings> = RwLock::new(Settings::new().unwrap());
}

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

        let mut socket = socket.try_clone().unwrap();
        if let Err(err) = pool.submit(move || submission.judge(&mut socket)) {
            eprintln!("Pool submission error: {:?}", err);
        };
    }
}

const BOOMER: () = ();

fn main() -> Result<(), Box<dyn Error>> {
    let pool = WorkerPool::new((num_cpus::get() - 1).max(1));

    let listener = TcpListener::bind("127.0.0.1:2929")?;

    let _ = SETTINGS.read();

    let submission: Submission = serde_json::from_str(
        r##"{
            "id": 1,
            "lang": "c",
            "source": "#include<stdio.h>\nint main(){printf(\"Hello, World!\\n\");}",
            "testCases": { "compareOutput": [["", "Hello World!"],["", "Hello World"]] },
            "timeLimit": 1000
        }"##,
    )
    .unwrap();

    let mut buf = vec![];
    submission.judge(&mut buf);
    println!("{}", String::from_utf8_lossy(&buf));

    while let Ok((socket, addr)) = listener.accept() {
        eprintln!("Incoming connection from {}", addr);
        handle_connection(socket, &pool);
    }

    Ok(BOOMER)
}
