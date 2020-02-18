use std::error::Error;
use std::path::PathBuf;
use std::{fs, env, io};

use crate::SETTINGS;

pub struct Sandbox {
    dir: PathBuf,
    lang: Language,
}

impl Sandbox {
    pub fn new(lang: Language, source: String) -> Result<Self, Box<dyn Error>> {
        // Create sandbox directory
        let mut suffix = 0;
        let dir = loop {
            let path = env::temp_dir().join(format!("beetle-sandbox-{}", suffix));
            let res = fs::create_dir(&path);
            if res.is_ok() {
                break path;
            }
            if res.unwrap_err().kind() == io::ErrorKind::AlreadyExists {
                suffix += 1;
            }
        };

        // Copy in compiler & libs


        // Write source code
        let src_file = dir
            .join(format!("source.{}", lang));
        fs::write(src_file, &source)?;

        // do the _e 🅱️ i c_ compile

        Ok(Sandbox { dir, lang })
    }
}
