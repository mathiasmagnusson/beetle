use serde::{Deserialize, Serialize};
use std::net::TcpStream;
use std::error::Error;

use crate::settings::Language;

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

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Submission {
    id: u64,
    lang: Language,
    source: String,
    test_cases: TestCases,
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

impl Submission {
    pub fn judge(&self, _socket: &mut TcpStream) -> Result<(), Box<dyn Error>> {
        eprintln!("Judging submission {}", self.id);

        // create sandbox

        // Loop through test cases

        eprintln!("Done judging submission {}", self.id);

        Ok(())
    }
}
