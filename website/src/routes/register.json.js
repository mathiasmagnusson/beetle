import database from "../database.js";
import bcrypt from "bcrypt";

export async function post(req, res) {
	const {
		username,
		email,
		password,
	} = req.body;

	if (!username || !email || !password)
		return res.status(400).send({ msg: "Missing username/password" });

	const hash = await bcrypt.hash(password, 12);

	let result;
	try {
		result = await database.query(
			"INSERT INTO account (username, email, password) VALUES (?, ?, ?)",
			[username, email, hash]
		);
	}
	catch (err) {
		if (err.code === "ER_DUP_ENTRY") {
			return res.status(400).send({ msg: "username taken" });
		}
		console.error(err);
		return res.status(500).send({ msg: "unknown error" });
	}

	res.send({ msg: "Account created" });
}
