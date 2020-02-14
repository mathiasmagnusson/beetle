use std::{convert::TryFrom, io};

#[derive(Debug)]
enum Language {
    C,
    CC,
}

impl TryFrom<&str> for Language {
    type Error = io::Error;
    fn try_from(s: &str) -> Result<Language, Self::Error> {
        use Language::*;
        match s {
            "c" => Ok(C),
            "cc" => Ok(CC),
            _ => Err(Self::Error::from(io::ErrorKind::InvalidInput)),
        }
    }
}

pub enum TestCases {
    CompareOutput(Vec<(Vec<u8>, Vec<u8>)>),
    ValidationScript {
        inputs: Vec<Vec<u8>>,
        script: Vec<u8>,
    },
}

pub struct Submission {
    lang: Language,
    source: Vec<u8>,
    test_cases: TestCases,
}

impl Submission {
    pub fn new(
        lang: &str,
        source: Vec<u8>,
        test_cases: TestCases,
    ) -> Result<Submission, io::Error> {
        Ok(Self {
            lang: Language::try_from(lang)?,
            source,
            test_cases,
        })
    }
    pub fn judge(&mut self) {
        eprintln!("Judging submission");
    }
}
