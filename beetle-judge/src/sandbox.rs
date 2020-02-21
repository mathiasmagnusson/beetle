use std::error::Error;
use std::path::PathBuf;
use std::{env, fs, io};

use crate::settings::Language;
use crate::SETTINGS;

pub struct Sandbox {
	dir: PathBuf,
	lang: String,
}

impl Sandbox {
	pub fn new(lang: String, source: String) -> Result<Self, Box<dyn Error>> {
		let sr = SETTINGS.read()?;
		let lang_ref = match sr.languages.get(&lang) {
			Some(lang) => lang,
			None => {
				return Err(Box::new(io::Error::new(
					io::ErrorKind::InvalidInput,
					"Unknown language",
				)))
			}
		};

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
		for dependency in &lang_ref.dependencies {
			let src = PathBuf::from(dependency);
			let dst = if src.has_root() {
				dir.join(src.strip_prefix("/").unwrap())
			} else {
				dir.join(&src)
			};

			if !src.is_file() {
				return Err(Box::new(io::Error::new(
					io::ErrorKind::Other,
					"all dependencies must be files",
				)));
			}

			fs::create_dir_all(dst.parent().unwrap())?;

			fs::copy(src, dst)?;
		}

		// Write source code
		let src_file = dir.join(format!("source.{}", lang_ref.file_suffix));
		fs::write(src_file, &source)?;

		// Copy in proxy program


		// do the _e 🅱️ i c_ compile


		Ok(Sandbox { dir, lang })
	}
}

impl Drop for Sandbox {
	fn drop(&mut self) {
		if let Err(err) = fs::remove_dir_all(&self.dir) {
			eprintln!("Could not remove sandbox dir {:?}:\n{:?}", self.dir, err);
		};
	}
}
