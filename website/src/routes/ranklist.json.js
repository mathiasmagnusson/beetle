import database from "../database.js";
import depthify from "../depthify.js";

export async function get(req, res) {
	let { start, count } = req.query;

	start = parseInt(start);
	count = parseInt(count);

	if (isNaN(start) || start < 0) start = 0;
	if (isNaN(count) || count <= 0) count = 20;

	const ranklist = await database.query(
		`SELECT DISTINCT
			username,
			full_name AS fullName,
			COALESCE(SUM(points), 0) AS points
		FROM account, problem
		WHERE account.id != author_id
		AND (account.id, problem.id) IN (
			SELECT
				account_id,
				problem_id
			FROM
				submission
			WHERE
				status = 'accepted'
		)
		GROUP BY account.id
		ORDER BY points DESC
		LIMIT ?, ?`,
		[start, count]
	);

	res.send(ranklist);
}
