import bcrypt from "bcrypt";
import database, { saltRounds } from "../database.js";
import emailValidator from "email-validator";

export async function post(req, res) {
	const {
		username,
		fullName,
		email,
		password,
	} = req.body;

	if (!username || !email || !password)
		return res.status(400).send({ msg: "Missing username/password" });

	const usernameRegex = /[^-\p{L}\d]/u;
	if (usernameRegex.test(username))
		return res.status(400).send({ msg: "Invalid character in username. Only word characters, dashes and numbers allowed" });

	if (username.length > 20)
		return res.status(400).send({ msg: "Too long username, max 20 characters" });

	if (typeof fullName === "string" && fullName.length > 40)
		return res.status(400).send({ msg: "Too long full name, max 40 characters" });

	const fullNameRegex = /[^-\p{L} ]/u;
	if (typeof fullName === "string" && fullNameRegex.text(fullName))
		return res.status(400).send({ msg: "Invalid character in full name. Only word characters, spaces and dashes allowed" })

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
