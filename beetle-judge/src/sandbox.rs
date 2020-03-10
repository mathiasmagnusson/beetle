use std::error::Error;
use std::path::PathBuf;
use std::{env, fs, io};
use std::process::Command;

use crate::SETTINGS;

#[derive(Debug)]
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
        for dependency in lang_ref.dependencies.iter().flat_map(|dep| glob::glob(dep).unwrap()) {
            let src = PathBuf::from(dependency?);
            let dst = if src.has_root() {
                dir.join(src.strip_prefix("/")?)
            } else {
                dir.join(&src)
            };

            if src.is_file() {
                fs::create_dir_all(dst.parent().unwrap())?;

                fs::copy(src, dst)?;
            }/* else {
                eprintln!("not file: {:?}", src);
                return Err(Box::new(io::Error::new(
                    io::ErrorKind::Other,
                    "all dependencies must be files",
                )));
            }*/
        }

        // Write source code
        let src_file_name = format!("source.{}", lang_ref.file_suffix);
        let src_file = dir.join(&src_file_name);
        fs::write(src_file, &source)?;

        eprintln!("Doing de ebic bombile");

        // do the _e 🅱️ i c_ compile
        let comp_out = Command::new("./executor")
            .arg(dir.as_os_str())
            .arg(format!("{}", sr.judge_inst_uid))
            .arg(&lang_ref.compiler_command)
            .args(lang_ref.compiler_args.iter().map(|arg| arg.replace("%", &src_file_name)))
            .output()?;

        eprintln!("Stdout: {}", String::from_utf8_lossy(&comp_out.stdout));
        eprintln!("Stderr: {}", String::from_utf8_lossy(&comp_out.stderr));

        if !comp_out.status.success() {
            return Err(Box::new(io::Error::new(
                io::ErrorKind::Other,
                "could not compile program",
            )));
        }

        Ok(Sandbox { dir, lang })
    }
    // pub fn run_test_case(...) -> ... { }
}

impl Drop for Sandbox {
    fn drop(&mut self) {
        if let Err(err) = fs::remove_dir_all(&self.dir) {
            eprintln!("Could not remove sandbox dir {:?}:\n{:?}", self.dir, err);
        };
    }
}
