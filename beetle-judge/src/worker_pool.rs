use std::{
    io,
    sync::{mpsc, Arc, Mutex},
    thread,
};

enum Message {
    Job(Job),
    Stop,
}

type Job = Box<dyn FnOnce() + Send + 'static>;

pub struct WorkerPool {
    sender: mpsc::Sender<Message>,
    workers: Vec<Worker>,
}

impl WorkerPool {
    pub fn new(workers: usize) -> Self {
        let (sender, receiver) = mpsc::channel();

        let arc = Arc::new(Mutex::new(receiver));

        Self {
            sender,
            workers: (0..workers)
                .map(|_| Worker::new(Arc::clone(&arc)))
                .collect(),
        }
    }
    pub fn submit<J>(&self, job: J) -> Result<(), io::Error>
    where
        J: FnOnce() + Send + 'static,
    {
        match self.sender.send(Message::Job(Box::new(job))) {
            Ok(()) => Ok(()),
            Err(_) => Err(io::Error::from(io::ErrorKind::Other)),
        }
    }
}

impl Drop for WorkerPool {
    fn drop(&mut self) {
        eprintln!("Shutting down worker pool");
        for _ in &self.workers {
            self.sender.send(Message::Stop).unwrap();
        }
        for worker in &mut self.workers {
            if let Some(thread) = worker.thread.take() {
                thread.join().unwrap();
            }
        }
    }
}

struct Worker {
    thread: Option<thread::JoinHandle<()>>,
}

impl Worker {
    pub fn new(receiver: Arc<Mutex<mpsc::Receiver<Message>>>) -> Self {
        let thread = thread::spawn(move || {
            while let Ok(message) = receiver.lock().unwrap().recv() {
                match message {
                    Message::Job(job) => job(),
                    Message::Stop => {
                        eprintln!("Shutting down worker ({:?})", thread::current().id());
                        break;
                    }
                }
            }
        });

        Self {
            thread: Some(thread),
        }
    }
}
