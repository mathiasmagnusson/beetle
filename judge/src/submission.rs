use serde::{Deserialize, Serialize};
use std::io::Write;

use crate::{sandbox, Sandbox, settings::Settings};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum TestCases {
    CompareOutput(Vec<(String, String)>),
    ValidationScript { inputs: Vec<String>, script: String },
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Response {
    id: u64,
    test_cases_suceeded: usize,
    status: Status,
    max_time: Option<u128>,
    max_memory: Option<u128>,
}

#[derive(Serialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum Status {
    Pending,
    Accepted,
    JudgeError,
    WrongAnswer,
    RuntimeError,
    CompilationError,
    TimeLimitExceeded,
    // MemoryLimitExceeded,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Submission {
    id: u64,
    lang: String,
    source: String,
    test_cases: TestCases,
    time_limit: u128,
    // memory_limit: u64,
}

impl Submission {
    pub fn judge<T: Write>(&self, settings: &Settings, writable: &mut T) {
        eprintln!("Judging submission {}", self.id);

        // create sandbox
        let sandbox = match Sandbox::new(settings, &self.lang, &self.source) {
            Ok(s) => s,
            Err(sandbox::Error::CompilationError(_code, _output)) => {
                write!(
                    writable,
                    "{}\n",
                    serde_json::ser::to_string(&Response {
                        id: self.id,
                        status: Status::CompilationError,
                        test_cases_suceeded: 0,
                        max_time: None,
                        max_memory: None,
                    })
                    .unwrap()
                )
                .unwrap();
                return;
            }
            Err(_) => {
                write!(
                    writable,
                    "{}\n",
                    serde_json::ser::to_string(&Response {
                        id: self.id,
                        status: Status::JudgeError,
                        test_cases_suceeded: 0,
                        max_time: None,
                        max_memory: None,
                    })
                    .unwrap()
                )
                .unwrap();
                return;
            }
        };

        let mut max_time = 0;

        // Loop through test cases
        match &self.test_cases {
            TestCases::CompareOutput(cases) => {
                for (i, (input, output)) in cases.iter().enumerate() {
                    match sandbox.run_test_case(settings, input, output, self.time_limit) {
                        Ok((Status::Accepted, time)) if i == cases.len() - 1 => {
                            max_time = time.unwrap_or(max_time).max(max_time);
                            write!(
                                writable,
                                "{}\n",
                                serde_json::ser::to_string(&Response {
                                    id: self.id,
                                    status: Status::Accepted,
                                    test_cases_suceeded: cases.len(),
                                    max_time: Some(max_time),
                                    max_memory: Some(69),
                                })
                                .unwrap()
                            )
                            .unwrap()
                        }
                        Ok((Status::Accepted, time)) => {
                            max_time = time.unwrap_or(max_time).max(max_time);
                            write!(
                                writable,
                                "{}\n",
                                serde_json::ser::to_string(&Response {
                                    id: self.id,
                                    status: Status::Pending,
                                    test_cases_suceeded: i + 1,
                                    max_time: Some(max_time),
                                    max_memory: Some(69),
                                })
                                .unwrap()
                            )
                            .unwrap()
                        }
                        Ok((status, time)) => {
                            max_time = time.unwrap_or(max_time).max(max_time);
                            write!(
                                writable,
                                "{}\n",
                                serde_json::ser::to_string(&Response {
                                    id: self.id,
                                    status,
                                    test_cases_suceeded: i,
                                    max_time: Some(max_time),
                                    max_memory: Some(69),
                                })
                                .unwrap()
                            )
                            .unwrap();
                            break;
                        }
                        Err(_) => {
                            write!(
                                writable,
                                "{}\n",
                                serde_json::ser::to_string(&Response {
                                    id: self.id,
                                    status: Status::JudgeError,
                                    test_cases_suceeded: 0,
                                    max_time: None,
                                    max_memory: None,
                                })
                                .unwrap()
                            )
                            .unwrap();
                            break;
                        }
                    };
                }
            }
            TestCases::ValidationScript { .. } => {
                unimplemented!();
            }
        }

        eprintln!("Done judging submission {}", self.id);
    }
}
