import bcrypt from "bcrypt";
import database, { saltRounds } from "../../database.js";

export async function post(req, res) {
	const {
		oldPassword,
		newPassword,
	} = req.body;

	if (!oldPassword || !newPassword)
		return res.status(400).send({ msg: "Missing old / new pasword" });

	if (!req.token)
		return res.status(401).send({ msg: "You must log in first" });

	const result = await database.query(
		"SELECT hash FROM account WHERE id = ?",
		req.token.id,
	);

	if (result.length == 0)
		return res.status(401).send({ msg: "You must log in first" });

	const { hash } = result[0];

	const passwordCorrect = await bcrypt.compare(oldPassword, hash);

	if (!passwordCorrect)
		return res.status(406).send({ msg: "Invalid password" });

	const newHash = await bcrypt.hash(newPassword, saltRounds);

	const updateResult = await database.query(
		"UPDATE account SET hash = ? WHERE id = ?",
		[newHash, req.token.id],
	);

	res.status(200).send({ msg: "Password changed" });
}
