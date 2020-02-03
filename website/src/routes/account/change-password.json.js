import bcrypt from "bcrypt";
import database, { saltRounds } from "../../database.js";
import * as responses from "../../responses.js"

export async function post(req, res) {
	const {
		oldPassword,
		newPassword,
	} = req.body;

	if (!oldPassword) return responses.missingParam("old password");
	if (!newPassword) return responses.missingParam("new password");

	if (!req.token)
		return responses.mustLogin();

	const result = await database.query(
		"SELECT hash FROM account WHERE id = ?",
		req.token.id,
	);

	if (result.length == 0)
		return responses.mustLogin();

	const { hash } = result[0];

	const passwordCorrect = await bcrypt.compare(oldPassword, hash);

	if (!passwordCorrect)
		return responses.invalid(res, "password");

	const newHash = await bcrypt.hash(newPassword, saltRounds);

	const updateResult = await database.query(
		"UPDATE account SET hash = ? WHERE id = ?",
		[newHash, req.token.id],
	);

	res.status(200).send({ msg: "Password changed" });
}
