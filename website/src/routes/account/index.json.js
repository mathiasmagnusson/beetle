import database from "../../database.js"
import * as responses from "../../responses.js"

export async function get(req, res) {
	if (!req.token)
		return responses.mustLogin(res);

	const accountResult = await database.query(
		`SELECT
			username,
			full_name AS fullName,
			email
		FROM account
		WHERE id = ?`,
		req.token.id
	);

	const { username, fullName, email } = accountResult[0];

	const authoredProblems = await database.query(
		`SELECT
			short_name AS shortName,
			long_name AS longName
		FROM account, problem
		WHERE account.id = author_id
		AND account.id = ?`,
		req.token.id
	);

	const pointsResult = await database.query(
		`SELECT
			COALESCE(SUM(points), 0) AS points
		FROM problem
		WHERE id IN (
			SELECT
				problem_id
			FROM
				account,
				submission
			WHERE account.id = ?
			AND account_id = account.id
			AND author_id != account.id
			AND status = 'accepted'
		)`,
		req.token.id
	);

	const points = pointsResult.length == 1 ? pointsResult[0].points : 0;

	res.send({ username, fullName, email, authoredProblems, points });
}
