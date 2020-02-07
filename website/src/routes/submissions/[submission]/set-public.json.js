import database from "../../../database.js";
import * as responses from "../../../responses.js";

export async function post(req, res) {
	if (!req.token)
		return responses.mustLogin(res);

	const { submission } = req.params;

	const toBePublic = req.body.public;

	if (typeof toBePublic !== "boolean")
		return res.status(400).send({
			msg: "Parameter 'public' must be a boolean"
		});

	if (isNaN(submission))
		return res.status(400).send({
			msg: "Submission id must be a number"
		})

	const result = await database.query(
		`UPDATE submission
		SET public = ?
		WHERE id = ?
		AND account_id = ?`,
		[toBePublic, submission, req.token.id]
	);

	if (result.affectedRows === 0)
		return res.status(404).send({
			msg: "Submission not found / operation not permitted"
		});

	res.send({
		msg: `Submission ${submission} set to ` +
			(toBePublic ? "public" : "private")
	});
}
