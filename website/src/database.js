import creds from "./creds.json";
import mysql from "mysql";

export const saltRounds = 12;

class Database {
	constructor() {
		this.connect();

		[`CREATE TABLE IF NOT EXISTS account (
			id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,

			username VARCHAR(20) NOT NULL,
			full_name VARCHAR(40) NULL,
			email VARCHAR(40) NULL,
			hash VARCHAR(60) NOT NULL,

			UNIQUE (username)
		)`,
		`CREATE TABLE IF NOT EXISTS problem (
			id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,

			short_name VARCHAR(30) NOT NULL,
			long_name VARCHAR(40),
			author_id INT NOT NULL,

			points INT NOT NULL,
			testing_method ENUM('run-script', 'compare-output') NOT NULL,
			validation_script TEXT NULL, # null if testing_method is 'run-script'

			time_limit_ms INT NOT NULL,
			memory_limit_mb INT NOT NULL,

			description TEXT NOT NULL,

			UNIQUE (short_name),
			FOREIGN KEY (author_id) REFERENCES account(id)
		)`,
		`CREATE TABLE IF NOT EXISTS vote (
			id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,

			problem_id INT NOT NULL,
			account_id INT NOT NULL,

			type ENUM('up', 'down'),

			UNIQUE (problem_id, account_id),

			FOREIGN KEY (problem_id) REFERENCES problem(id),
			FOREIGN KEY (account_id) REFERENCES account(id)
		)`,
		`CREATE TABLE IF NOT EXISTS test_case (
			id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,

			problem_id INT NOT NULL,

			input TEXT NOT NULL,
			correct_output TEXT NULL, # null if problem's testing_method is 'run-script'

			FOREIGN KEY (problem_id) REFERENCES problem(id)
		)`,
		`CREATE TABLE IF NOT EXISTS submission (
			id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,

			problem_id INT NOT NULL,
			account_id INT NOT NULL,

			public BOOLEAN NOT NULL,

			timestamp INT NOT NULL, # unix timestamp, whole seconds

			lang VARCHAR(4) NOT NULL, # file ending, like: c, cc, rs, js, hs, java

			source TEXT NOT NULL,

			status ENUM(
				'pending',
				'accepted',
				'judge-error',
				'wrong-answer',
				'runtime-error',
				'compilation-error',
				'time-limit-exceeded',
				'memory-limit-exceeded'
			) NOT NULL,
			max_runtime_ms INT, # null when status is pending or compilation-error
			max_memory_mb INT, # null when status is pending or compilation-error
			test_cases_succeeded INT, # null when status is compilation-error

			FOREIGN KEY (problem_id) REFERENCES problem(id),
			FOREIGN KEY (account_id) REFERENCES account(id)
		)`,]
			.forEach(async (query, i) => {
				try {
					await this.query(query);
				}
				catch (err) {
					console.error(`Error creating database table ${i}:`);
					console.error(err);
					process.exit(-1);
				}
			});

		if (process.env.NODE_ENV === "development")
			this.setupTestDatabase();
	}

	connect() {
		const { host, user, password, database } = creds.mysql;

		this.inner = mysql.createConnection({
			host,
			user,
			password,
			database,
		});

		this.inner.connect(err => {
			if (err) {
				console.error("inner.connect err: ");
				console.error(err);
				setTimeout(() => this.connect(), 5000);
			}
		});

		this.inner.on("error", err => {
			if (err.errno !== -104) {
				console.error("inner.on(\"error\"): ");
				console.error(err);
			}
			setTimeout(() => this.connect(), 5000);
		});
	}

	query(query, args) {
		return new Promise((resolve, reject) => {
			this.inner.query(query, args, (err, result) => {
				if (err) reject(err);
				else resolve(result);
			});
		});
	}
}

export default new Database();
