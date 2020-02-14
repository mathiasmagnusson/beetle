use std::{
    io,
    net::{TcpListener, TcpStream},
};

#[cfg(test)]
mod tests;

mod submission;
mod worker_pool;

use submission::{Submission, TestCases};
use worker_pool::WorkerPool;

fn main() -> io::Result<()> {
    let pool = WorkerPool::new(num_cpus::get());

    let listener = TcpListener::bind("0.0.0.0:2929")?;

    let mut submission = Submission::new(
        "c",
        br#"
            #include<stdio.h>

            int main() {
                long long a, b;
                scanf("%lld%lld", &a, &b);
                printf("%lld", a + b);
                return 0;
            }
        "#
        .to_vec(),
        TestCases::CompareOutput(vec![
            (b"1 1\n".to_vec(), b"2\n".to_vec()),
            (b"5894 24931\n".to_vec(), b"30825\n".to_vec()),
        ]),
    )?;

    pool.submit(Box::new(move || submission.judge()))?;

    Ok(())
}
