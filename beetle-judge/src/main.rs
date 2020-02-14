use std::collections::VecDeque;
use std::convert::TryFrom;
use std::io::Error;

#[cfg(test)]
mod tests;

enum Language {
    C,
    CC,
}

impl TryFrom<&str> for Language {
    type Error = Error;
    fn try_from(s: &str) -> Result<Language, Self::Error> {
        use Language::*;
        match s {
            "c" => Ok(C),
            "cc" => Ok(CC),
            _ => Err(Error::from(std::io::ErrorKind::InvalidInput)),
        }
    }
}

enum TestCases {
    CompareOutput(Vec<(Vec<u8>, Vec<u8>)>),
    ValidationScript {
        inputs: Vec<Vec<u8>>,
        script: Vec<u8>,
    }
}

struct Submission {
    lang: Language,
    source: Vec<u8>,
    test_cases: TestCases,
}

struct SubmissionQueue {
    queue: VecDeque<Submission>,
}

fn main() {
    println!("Hello, world!");
}
