use std::{collections::HashMap, error::Error};

use config::{Config, File};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug)]
pub struct Language {
    pub name: String,
    pub file_suffix: String,
    pub compiler_command: String,
    pub compiler_args: Vec<String>,
    pub dependencies: Vec<String>,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct Settings {
    pub languages: HashMap<String, Language>,
    pub judge_inst_uid: u32,
}

impl Settings {
    pub fn new() -> Result<Self, impl Error> {
        let c = Config::builder()
            .add_source(File::with_name("lang.yaml"))
            .build()?;

        c.try_deserialize::<Self>()
    }
}
