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
		`SELECT SUM(points) AS points
		FROM account, problem, submission
		WHERE account.id = ?
		AND submission.account_id = account.id
		AND problem.id = submission.problem_id
		AND account.id != problem.author_id
		AND submission.status = 'accepted'
		GROUP BY account.id`,
		req.token.id
	);

	const points = pointsResult.length == 1 ? pointsResult[0].points : 0;

	res.send({ username, fullName, email, authoredProblems, points });
}
