import database from "../../database.js"

export async function get(req, res) {
	const { username } = req.params;

	const authProbResult = await database.query(
		`SELECT account.id, full_name, short_name, long_name
		FROM account
		LEFT JOIN problem
		ON account.id = author_id
		WHERE username = ?`,
		username,
	);

	if (authProbResult.length == 0)
		return res.status(404).send({ msg: "Could not find user " + username });

	const { full_name: fullName, id } = authProbResult[0];

	let authoredProblems;
	if (!authProbResult[0].short_name)
		authoredProblems = [];
	else
		authoredProblems = authProbResult
			.map(problem => ({ shortName: problem.short_name, longName: problem.long_name }));

	const pointsResult = await database.query(
		`SELECT SUM(points) AS points
		FROM account, problem, submission
		WHERE account.id = ?
		AND submission.account_id = account.id
		AND problem.id = submission.problem_id
		AND account.id != problem.author_id
		GROUP BY account.id`,
		id
	);

	const points = pointsResult.length == 1 ? pointsResult[0].points : 0;

	res.send({ username, fullName, authoredProblems, points });
}
