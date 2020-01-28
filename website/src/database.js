import mysql from "mysql";
import creds from "./creds.json";

class Database {
	constructor() {
		[
			`CREATE TABLE IF NOT EXISTS account (
				id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
				username VARCHAR(20) NOT NULL,
				email VARCHAR(40) NULL,
				password VARCHAR(60) NOT NULL
			)`,
			`CREATE TABLE IF NOT EXISTS problem (
				id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
				short_name VARCHAR(30) NOT NULL,
				long_name VARCHAR(40),
				time_limit_ms INT NOT NULL,
				memory_limit_mb INT NOT NULL
			)`,
		]
	}
}

export default new Database();
