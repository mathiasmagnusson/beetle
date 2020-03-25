import database from "../../database.js";
import depthify from "../../depthify.js";

export async function get(req, res) {
	let { start, count } = req.query;

	start = parseInt(start);
	count = parseInt(count);

	if (isNaN(start) || start < 0) start = 0;
	if (isNaN(count) || count <= 0) count = 20;

	const problems = await database.query(
		`SELECT
			short_name AS shortName,
			long_name AS longName,
			points,
			COALESCE(upvotes, 0) AS upvotes,
			COALESCE(downvotes, 0) AS downvotes,
			COALESCE(succeeded, 0) AS succeeded,
			COALESCE(failed, 0) AS failed,
			username AS "author.username",
			full_name AS "author.fullName"
		FROM problem
		LEFT JOIN (
			SELECT
				problem_id,
				SUM(type = 'up') AS upvotes,
				SUM(type = 'down') AS downvotes
			FROM vote
			GROUP BY problem_id
		) AS votes
		ON votes.problem_id = problem.id
		LEFT JOIN (
			SELECT
				problem_id,
				SUM(status = 'accepted') AS succeeded,
				SUM(status != 'accepted' AND status != 'pending') AS failed
			FROM submission
			GROUP BY problem_id
		) AS submissions
		ON submissions.problem_id = problem.id
		LEFT JOIN account
		ON problem.author_id = account.id
		LIMIT ?, ?`,
		[start, count]
	);

	res.send(depthify(problems));
}
