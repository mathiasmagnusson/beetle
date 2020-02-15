use serde::{Deserialize, Serialize};
use std::net::TcpStream;
use std::fs;
use std::error::Error;

use crate::Language;

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

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Submission {
    id: u64,
    lang: Language,
    source: String,
    test_cases: TestCases,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Response {
    id: u64,
    test_cases_suceeded: usize,
    status: Status,
}

#[derive(Serialize, Deserialize)]
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

        let sub_dir = tempfile::Builder::new()
            .prefix(&format!("beetle-judge-{}-", self.id))
            .tempdir()?;

        // Write source to file
        let src_file = sub_dir
            .path()
            .join(format!("source.{}", self.lang.file_suffix()));
        fs::write(src_file, &self.source)?;

        // Compile source:
            // copy (/mount) in compiler & libs
            // do the _e 🅱️ i c_ compile

        // Loop through test cases
            // Run the program
            // give it the input
            // compare the output to the correct answer
            // report partial result and break on failiure

        eprintln!("Done judging submission {}", self.id);

        let dir_name = sub_dir.path().to_string_lossy().into_owned();
        if let Err(err) = sub_dir.close() {
            eprintln!(
                "Error cleaning up temporary directory '{}': {}",
                dir_name, err
            );
        }

        Ok(())
    }
}
