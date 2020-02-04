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

			FOREIGN KEY (author_id) REFERENCES account(id)
		)`,
		`CREATE TABLE IF NOT EXISTS vote (
			id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,

			problem_id INT NOT NULL,
			account_id INT NOT NULL,

			type ENUM('up', 'down'),

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

			timestamp INT NOT NULL, # unix timestamp, whole seconds

			lang VARCHAR(4) NOT NULL, # file ending, like: c, cc, rs, js, hs, java

			source TEXT NOT NULL,

			status ENUM(
				'pending',
				'accepted',
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

	// TODO: remove before production
	async setupTestDatabase() {
		const bcrypt = await import("bcrypt");

		const r1 = await this.query(
			"SELECT COUNT(*) as accounts FROM account"
		);

		if (r1[0].accounts > 0) return;

		console.log("Creating test database");
		await Promise.all([
			this.query(
				"INSERT INTO account (username, full_name, email, hash) VALUES (?, ?, ?, ?)",
				["foodelevator", "Mathias Magnusson", "mathias@magnusson.space", await bcrypt.hash("password", saltRounds)]
			),
			this.query(
				"INSERT INTO account (username, full_name, email, hash) VALUES (?, ?, ?, ?)",
				["robofån", "Robin Karlberg", "root@bumbis.se", await bcrypt.hash("password", saltRounds)]
			),
			this.query(
				`INSERT INTO problem (
					short_name,
					long_name,
					author_id,
					points,
					testing_method,
					time_limit_ms,
					memory_limit_mb,
					description
				) VALUES (
					'add',
					'Addition',
					1,
					1,
					'compare-output',
					1000,
					1024,
'\\\\title{Addition}\n\\\\begin{document}\n\n\\\\section{Input}\nThe input contains two integers, $a$ and $b$, separated by a space. $0 \\\\lte a, b \\\\lte {10}^{38}$\n\n\\\\section{Output}\nOutput the sum of $a$ and $b$ on a single line.\n\n\\\\end{document}\n'
				)`
			),
			this.query(
				`INSERT INTO test_case (
					problem_id,
					input,
					correct_output
				) VALUES (
					1,
					'1 1\n',
					'2'
				)`
			),
			this.query(
				`INSERT INTO test_case (
					problem_id,
					input,
					correct_output
				) VALUES (
					1,
					'170141183460469231731687303715884105727 170141183460469231731687303715884105666\n',
					'340282366920938463463374607431768211393'
				)`
			),
			this.query(
				`INSERT INTO submission (
					problem_id,
					account_id,
					timestamp,
					lang,
					source,
					status,
					max_runtime_ms,
					max_memory_mb,
					test_cases_succeeded
				) VALUES (
					1,
					1,
					?,
					'py3',
					'a, b = map(int, input())\n\nprint(a + b)\n',
					'accepted',
					27,
					61,
					2
				)`,
				Math.floor(Date.now() / 1000) - 1000,
			),
			this.query(
				`INSERT INTO submission (
					problem_id,
					account_id,
					timestamp,
					lang,
					source,
					status,
					max_runtime_ms,
					max_memory_mb,
					test_cases_succeeded
				) VALUES (
					1,
					2,
					?,
					'py2',
					'a, b = map(int, raw_input())\n\nprint a + b\n',
					'accepted',
					20,
					50,
					2
				)`,
				Math.floor(Date.now() / 1000),
			),
			this.query(
				`INSERT INTO vote (
					problem_id,
					account_id,
					type
				) VALUE (
					1,
					1,
					'up'
				)`,
			)
		]);
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
			console.error("inner.on(\"error\"): ");
			console.error(err);
			setTimeout(() => this.console(), 5000);
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
