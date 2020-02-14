use serde::{Deserialize, Serialize};
use std::net::TcpStream;
use std::io::Write;

#[derive(Serialize, Deserialize)]
enum Language {
    C,
    CC,
}

#[derive(Serialize, Deserialize)]
pub enum TestCases {
    CompareOutput(Vec<(String, String)>),
    ValidationScript {
        inputs: String,
        script: String,
    },
}

#[derive(Serialize, Deserialize)]
pub struct Submission {
    lang: Language,
    source: String,
    test_cases: TestCases,
}

impl Submission {
    pub fn judge(&self, socket: TcpStream) {
        eprintln!("Judging submission");
        let _ = write!(&socket, "You get an A\n");
    }
}
