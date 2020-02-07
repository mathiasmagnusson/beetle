import database from "../../database.js";
import * as responses from "../../responses.js";
import depthify from "../../depthify.js";

export async function get(req, res) {
	if (!req.token)
		return responses.mustLogin(res);

	const submissions = await database.query(
		`SELECT
			submission.id,
			public,
			timestamp,
			lang,
			status,
			short_name AS "problem.shortName",
			long_name AS "problem.longName"
		FROM submission, problem
		WHERE submission.problem_id = problem.id
		AND submission.account_id = ?`,
		req.token.id,
	);

	res.send(depthify(submissions));
}
