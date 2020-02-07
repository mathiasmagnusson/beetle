import database from "../../../database.js";
import * as responses from "../../../responses.js";

export async function post(req, res) {
	const { type } = req.body;
	const { problem } = req.params;

	if (!req.token)
		return responses.mustLogin(res);

	if (!type)
		return responses.missingParam(res, "type");

	if (type !== "up" && type !== "down")
		return res.status(400).send({ msg: "Vote type must be 'up' or 'down'" });

	try {
		const result = await database.query(
			`INSERT INTO vote (
				problem_id,
				account_id,
				type
			)
			SELECT id, ?, ?
			FROM problem
			WHERE short_name = ?`,
			[req.token.id, type, problem]
		);
	}
	catch (err) {
		console.log(err);
		if (err.code === "ER_DUP_ENTRY")
			return res.send(406).send({ msg: "You have already voted on this problem" });

	}

	res.send({ msg: "Vote cast" });
}
