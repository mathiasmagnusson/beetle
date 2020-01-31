import bcrypt from "bcrypt";
import database, { saltRounds } from "../../database.js";
import emailValidator from "email-validator";

export async function post(req, res) {
	const {
		password,
		email,
	} = req.body;

	if (!password || !email)
		return res.status(400).send({ msg: "Missing old / new pasword" });

	if (!emailValidator.validate(email))
		return res.status(400).send({ msg: "Malformatted email" });

	if (!req.token)
		return res.status(401).send({ msg: "You must log in first" });

	const result = await database.query(
		"SELECT hash FROM account WHERE id = ?",
		req.token.id,
	);

	if (result.length == 0)
		return res.status(401).send({ msg: "You must log in first" });

	const { hash } = result[0];

	const passwordCorrect = await bcrypt.compare(password, hash);

	if (!passwordCorrect)
		return res.status(406).send({ msg: "Invalid password" });

	const updateResult = await database.query(
		"UPDATE account SET email = ? WHERE id = ?",
		[email, req.token.id],
	);

	res.status(200).send({ msg: "Email changed" });
}
