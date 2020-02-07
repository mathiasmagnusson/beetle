import database from "../../../database.js";

export async function get(req, res) {
	const { problem } = req.params;

	const problemResult = await database.query(
		`SELECT
			problem.id,
			long_name,
			points,
			time_limit_ms,
			memory_limit_mb,
			description,
			full_name,
			username,
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
		long_name: longName,
		points,
		time_limit_ms: timeLimit,
		memory_limit_mb: memoryLimit,
		description,
		full_name: authorFullName,
		username: authorUsername,
		upvotes,
		downvotes,
	} = problemResult[0];

	const statusDistributionResult = await database.query(
		`SELECT status, COUNT(*) AS count
		FROM problem, submission
		WHERE problem.id = submission.problem_id
		AND problem.id = ?
		GROUP BY status`,
		id
	);

	const statusDistribution = statusDistributionResult.map(row => row);

	const averageResouceHoggingResult = await database.query(
		`SELECT
			AVG(max_runtime_ms) AS averageRuntime,
			AVG(max_memory_mb) AS averageMemory
		FROM problem, submission
		WHERE problem.id = submission.problem_id
		AND status = 'accepted'
		AND problem.id = ?`,
		id
	);

	const averageResouceHogging = averageResouceHoggingResult.map(row => row);

	res.send({
		longName,
		points,
		timeLimit,
		memoryLimit,
		description,
		author: {
			fullName: authorFullName,
			username: authorUsername,
		},
		statusDistribution,
		averageResouceHogging,
		upvotes,
		downvotes,
	});
}
