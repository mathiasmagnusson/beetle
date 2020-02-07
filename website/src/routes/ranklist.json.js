import database from "../database.js";
import depthify from "../depthify.js";

export async function get(req, res) {
	let { start, count } = req.query;

	start = parseInt(start);
	count = parseInt(count);

	if (isNaN(start)) start = 0;
	if (isNaN(count)) count = 20;

	const ranklist = await database.query(
		`SELECT DISTINCT
			username,
			full_name AS fullName,
			COALESCE(SUM(points), 0) AS points
		FROM account
		LEFT JOIN submission
		ON account_id = account.id
		LEFT JOIN problem
		ON problem.id = submission.problem_id AND author_id != account.id
		WHERE status = 'accepted'
		GROUP BY account.id, submission.id
		ORDER BY points DESC
		LIMIT ?, ?`,
		[start, count]
	);

	res.send(ranklist);
}
