use std::io::{Read, Write};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::{env, fs, io, thread, time};

use crate::submission::Status;
use crate::SETTINGS;

#[derive(Debug)]
pub enum Error {
    CompilationError(i32, Vec<u8>),
    JudgeError,
}

#[derive(Debug)]
pub struct Sandbox {
    dir: PathBuf,
    lang: String,
}

impl Sandbox {
    pub fn new(lang: &str, source: &str) -> Result<Self, Error> {
        let sr = SETTINGS.read().map_err(|_| Error::JudgeError)?;
        let lang_ref = match sr.languages.get(lang) {
            Some(lang) => lang,
            None => {
                return Err(Error::JudgeError);
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

        // Copy in dependencies
        for dependency in lang_ref
            .dependencies
            .iter()
            .flat_map(|dep| glob::glob(dep).unwrap())
        {
            let src = PathBuf::from(dependency.map_err(|_| Error::JudgeError)?);
            let dst = if src.has_root() {
                dir.join(src.strip_prefix("/").unwrap())
            } else {
                dir.join(&src)
            };

            if src.is_file() {
                fs::create_dir_all(dst.parent().unwrap()).map_err(|_| Error::JudgeError)?;

                let _ = fs::copy(&src, &dst);
            } else {
                eprintln!("Skipping dependency '{:?}' since its a folder", src);
                // return Err(Box::new(io::Error::new(
                //     io::ErrorKind::Other,
                //     "all dependencies must be files",
                // )));
            }
        }

        // Write source code
        let src_file_name = format!("source.{}", lang_ref.file_suffix);
        let src_file = dir.join(&src_file_name);
        fs::write(src_file, &source).map_err(|_| Error::JudgeError)?;

        eprintln!("Doing de ebic bombile");

        // do the E 🅱️ I C compile
        let comp_out = Command::new(&lang_ref.compiler_command)
            .current_dir(dir.as_os_str())
            .args(
                lang_ref
                    .compiler_args
                    .iter()
                    .map(|arg| arg.replace("%", &src_file_name)),
            )
            .output()
            .map_err(|_| Error::JudgeError)?;

        eprintln!("Stdout: {}", String::from_utf8_lossy(&comp_out.stdout));
        eprintln!("Stderr: {}", String::from_utf8_lossy(&comp_out.stderr));

        if !comp_out.status.success() {
            return Err(Error::CompilationError(
                comp_out.status.code().unwrap_or(0),
                comp_out.stderr,
            ));
        }

        Ok(Sandbox { dir, lang: lang.to_string() })
    }
    pub fn run_test_case(&self, input: &str, correct_output: &str, time_limit: u128) -> Result<Status, Error> {
        let sr = SETTINGS.read().map_err(|_| Error::JudgeError)?;

        let mut child = Command::new("./executor")
            .arg(self.dir.as_os_str())
            .arg(format!("{}", sr.judge_inst_uid))
            .arg("program")
            .stdout(Stdio::piped())
            .stdin(Stdio::piped())
            .spawn()
            .map_err(|_| Error::JudgeError)?;

        let start_time = time::Instant::now();

        child
            .stdin
            .as_mut()
            .ok_or(Error::JudgeError)?
            .write_all(input.as_bytes())
            .map_err(|_| Error::JudgeError)?;

        let status = loop {
            if let Ok(maybe_status) = child.try_wait() {
                let elapsed = start_time.elapsed();

                if elapsed.as_millis() > time_limit {
                    return Ok(Status::TimeLimitExceeded);
                }

                if let Some(status) = maybe_status {
                    break status;
                } else {
                    thread::yield_now();
                }
            } else {
                return Err(Error::JudgeError);
            }
        };

        if !status.success() {
            return Ok(Status::RuntimeError);
        }

        let bytes: Vec<u8> = child.stdout.unwrap().bytes().filter_map(|b| b.ok()).collect();

        let output = String::from_utf8_lossy(&bytes);

        if output.trim() == correct_output.trim() {
            Ok(Status::Accepted)
        } else {
            Ok(Status::WrongAnswer)
        }
    }
}

impl Drop for Sandbox {
    fn drop(&mut self) {
        if let Err(err) = fs::remove_dir_all(&self.dir) {
            eprintln!("Could not remove sandbox dir {:?}:\n{:?}", self.dir, err);
        };
    }
}
