import database from "../../database.js";

export async function get(req, res) {
	let { start, count } = req.body;

	if (!start) start = 0;
	if (!count) count = 20;

	const problemsResult = await database.query(
		`SELECT
			problem.id,
			short_name AS shortName,
			long_name AS longName,
			points,
			COALESCE(SUM(status = 'accepted'), 0) AS succeeded,
			COALESCE(SUM(status != 'accepted' AND status != 'pending'), 0) AS failed
		FROM problem
		LEFT JOIN submission ON problem.id = submission.problem_id
		GROUP BY problem.id
		LIMIT ?, ?`,
		[start, count]
	);

	const problems = {};
	for (const problem of problemsResult) {
		problems[problem.id] = {
			...problem,
			upvotes: 0,
			downvotes: 0,
		};
	}

	const votes = await database.query("SELECT problem_id AS pid, type FROM vote");

	for (const vote of votes) {
		if (vote.type == 'up')
			problems[vote.pid].upvotes++;
		if (vote.type == 'down')
			problems[vote.pid].downvotes++;
	}

	res.send(Array.from(Object.values(problems)));
}
