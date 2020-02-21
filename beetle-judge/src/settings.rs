use std::error::Error;
use std::collections::HashMap;

use config::{Config, File};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Language {
    pub name: String,
    pub file_suffix: String,
	pub compiler_command: String,
	pub dependencies: Vec<String>,
}

#[derive(Deserialize, Serialize)]
pub struct Settings {
    pub languages: HashMap<String, Language>,
}

impl Settings {
    pub fn new() -> Result<Self, impl Error> {
        let mut c = Config::new();

        c.merge(File::with_name("lang.yaml"))?;

        c.try_into().map_err(|err| Box::new(err))
    }
}
