use std::error::Error;
use std::collections::HashMap;

use config::{Config, File};
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Language {
    name: String,

}

#[derive(Deserialize, Serialize)]
pub struct Settings {
    languages: HashMap<String, Language>,
}

impl Settings {
    pub fn new() -> Result<Self, Box<dyn Error>> {
        let mut c = Config::new();

        c
            .merge(File::with_name("lang.yaml"))?;

        c.try_into().map_err(|err| Box::new(Error::from(err)))
    }
}
