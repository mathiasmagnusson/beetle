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
                println!("{}", line);
                let _ = write!(
                    socket,
                    "{}\n",
                    json!({ "type": "error", "msg": format!("{}", err) })
                );
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

    let listener = TcpListener::bind("127.0.0.1:48753")?;

    let _ = SETTINGS.read();

    while let Ok((socket, _addr)) = listener.accept() {
        handle_connection(socket, &pool);
    }

    Ok(BOOMER)
}
