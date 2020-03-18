use serde::{Deserialize, Serialize};
use std::io::Write;

use crate::{sandbox, Sandbox};

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
}

#[derive(Serialize, PartialEq)]
pub enum Status {
    Pending,
    Accepted,
    JudgeError,
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
    time_limit: u128,
    // memory_limit: u64,
}

impl Submission {
    pub fn judge<T: Write>(&self, writable: &mut T) {
        eprintln!("Judging submission {}", self.id);

        // create sandbox
        let sandbox = match Sandbox::new(&self.lang, &self.source) {
            Ok(s) => s,
            Err(sandbox::Error::CompilationError(_code, _output)) => {
                write!(
                    writable,
                    "{}\n",
                    serde_json::ser::to_string(&Response {
                        id: self.id,
                        status: Status::CompilationError,
                        test_cases_suceeded: 0,
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
                    })
                    .unwrap()
                )
                .unwrap();
                return;
            }
        };

        // Loop through test cases
        match &self.test_cases {
            TestCases::CompareOutput(cases) => {
                for (i, (input, output)) in cases.iter().enumerate() {
                    match sandbox.run_test_case(input, output, self.time_limit) {
                        Ok(Status::Accepted) if i == cases.len() - 1 => write!(
                            writable,
                            "{}\n",
                            serde_json::ser::to_string(&Response {
                                id: self.id,
                                status: Status::Accepted,
                                test_cases_suceeded: cases.len(),
                            })
                            .unwrap()
                        )
                        .unwrap(),
                        Ok(Status::Accepted) => write!(
                            writable,
                            "{}\n",
                            serde_json::ser::to_string(&Response {
                                id: self.id,
                                status: Status::Pending,
                                test_cases_suceeded: i + 1
                            })
                            .unwrap()
                        )
                        .unwrap(),
                        Ok(status) => {
                            write!(
                                writable,
                                "{}\n",
                                serde_json::ser::to_string(&Response {
                                    id: self.id,
                                    status,
                                    test_cases_suceeded: i
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
