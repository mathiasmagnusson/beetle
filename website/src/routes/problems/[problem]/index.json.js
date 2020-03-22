import database from "../../../database.js";
import depthify from "../../../depthify.js";

export async function get(req, res) {
	const { problem } = req.params;

	const problemResult = await database.query(
		`SELECT
			problem.id,
			long_name AS longName,
			points,
			time_limit_ms AS timeLimit,
			memory_limit_mb AS memoryLimit,
			description,
			username AS "author.username",
			full_name AS "author.fullName",
			COALESCE(SUM(type = 'up'), 0) AS upvotes,
			COALESCE(SUM(type = 'down'), 0) AS downvotes
		FROM problem
		LEFT JOIN account ON account.id = problem.author_id
		LEFT JOIN vote ON problem.id = vote.problem_id
		WHERE short_name = ?
		GROUP BY problem.id`,
		problem
	);

	if (problemResult.length == 0)
		return res.status(404).send({
			msg: "Could not find problem " + problem
		});

	const {
		id,
		longName,
		points,
		timeLimit,
		memoryLimit,
		description,
		author,
		upvotes,
		downvotes,
	} = depthify(problemResult[0]);

	const statusDistribution = await database.query(
		`SELECT status, COUNT(*) AS count
		FROM problem, submission
		WHERE problem.id = submission.problem_id
		AND problem.id = ?
		AND status != 'pending'
		GROUP BY status`,
		id
	);

	let averageResourceUsage = await database.query(
		`SELECT
			AVG(max_runtime_ms) AS time,
			AVG(max_memory_mb) AS memory
		FROM problem, submission
		WHERE problem.id = submission.problem_id
		AND status = 'accepted'
		AND problem.id = ?`,
		id
	);

	if (averageResourceUsage.length == 1) {
		averageResourceUsage = averageResourceUsage[0];
	} else {
		averageResourceUsage = null;
	}

	let userVote;
	if (req.token) {
		const vote = await database.query(
			`SELECT
				type
			FROM vote
			WHERE problem_id = ?
			AND account_id = ?`,
			[id, req.token.id]
		);

		if (vote.length != 0) {
			userVote = vote[0].type;
		}
	}

	res.send({
		longName,
		points,
		timeLimit,
		memoryLimit,
		description,
		author,
		statusDistribution,
		averageResourceUsage,
		upvotes,
		downvotes,
		userVote,
	});
}
