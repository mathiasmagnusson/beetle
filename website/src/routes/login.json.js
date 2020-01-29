import bcrypt from "bcrypt";
import database from "../database.js";

export async function post(req, res) {
	const { username, password } = req.body;

	if (!username || !password)
		return res.status(400).send({ msg: "Missing username/password" });

	const result = await database.query(
		"SELECT id, password AS hash FROM account WHERE username = ?",
		username,
	);

	if (result.length == 0) {
		return res.status(401).send({ msg: "Invalid username" });
	}

	const { id, hash } = result[0];

	const correctPassword = await bcrypt.compare(password, hash);

	if (!correctPassword)
		return res.status(401).send({ msg: "Invalid password" });

	req.token = { id };

	res.send({ msg: "Logged in" });
}
