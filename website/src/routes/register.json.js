import bcrypt from "bcrypt";
import database, { saltRounds } from "../database.js";
import emailValidator from "email-validator";

export async function post(req, res) {
	const {
		username,
		email,
		password,
	} = req.body;

	if (!username || !email || !password)
		return res.status(400).send({ msg: "Missing username/password" });

	if (!emailValidator.validate(email))
		return res.status(400).send({ msg: "Malformatted email" });

	const hash = await bcrypt.hash(password, saltRounds);

	let result;
	try {
		result = await database.query(
			"INSERT INTO account (username, email, hash) VALUES (?, ?, ?)",
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
