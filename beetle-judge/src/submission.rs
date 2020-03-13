use serde::{Deserialize, Serialize};
use std::net::TcpStream;
use std::error::Error;

use crate::settings::Language;
use crate::Sandbox;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TestCases {
    CompareOutput(Vec<(String, String)>),
    ValidationScript { inputs: Vec<String>, script: String },
}

impl TestCases {
    pub fn len(&self) -> usize {
        match self {
            TestCases::CompareOutput(v) => v.len(),
            TestCases::ValidationScript { inputs, .. } => inputs.len(),
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Response {
    id: u64,
    test_cases_suceeded: usize,
    status: Status,
}

#[derive(Serialize)]
enum Status {
    Pending,
    Accepted,
    WrongAnswer,
    RuntimeError,
    CompilationError,
    TimeLimitExceeded,
    MemoryLimitExceeded,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Submission {
    id: u64,
    lang: String,
    source: String,
    test_cases: TestCases,
}

impl Submission {
    pub fn judge(&self, _socket: &mut TcpStream) -> Result<(), Box<dyn Error>> {
        eprintln!("Judging submission {}", self.id);

        // create sandbox
		let sandbox = Sandbox::new(self.lang, self.source);

        // Loop through test cases

        eprintln!("Done judging submission {}", self.id);

        Ok(())
    }
}
