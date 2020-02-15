use std::error::Error;

use tempfile::TempDir;

use crate::Language;

pub struct Sandbox {
    dir: TempDir,
    lang: Language,
}

impl Sandbox {
    pub fn new(lang: Language, source: String) -> Result<Self, Box<dyn Error>> {
        // Create sandbox directory
        let dir = tempfile::Builder::new().prefix("beetle-judge").tempdir()?;

        // Mount compiler & libs

        // Write source code

        // Compile

        Ok(Sandbox { dir, lang })
    }
}
