import bcrypt from "bcrypt";
import database, { saltRounds } from "../../database.js";
import emailValidator from "email-validator";
import * as responses from "../../responses.js"

export async function post(req, res) {
	const {
		password,
		email,
	} = req.body;

	if (!password) return responses.missingParam(res, "password");
	if (!email) return responses.missingParam(res, "email");

	if (!emailValidator.validate(email))
		return res.status(400).send({ msg: "Malformatted email" });

	if (!req.token)
		return responses.mustLogin();

	const result = await database.query(
		"SELECT hash FROM account WHERE id = ?",
		req.token.id,
	);

	if (result.length == 0)
		return responses.mustLogin();

	const { hash } = result[0];

	const passwordCorrect = await bcrypt.compare(password, hash);

	if (!passwordCorrect)
		return responses.invalid(res, "password");

	const updateResult = await database.query(
		"UPDATE account SET email = ? WHERE id = ?",
		[email, req.token.id],
	);

	res.status(200).send({ msg: "Email changed" });
}
