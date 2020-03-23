import database from "../../../database.js"

export async function get(req, res) {
	const { username } = req.params;

	const authProbResult = await database.query(
		`SELECT
			account.id,
			full_name AS fullName,
			short_name AS shortName,
			long_name AS longName
		FROM account
		LEFT JOIN problem
		ON account.id = author_id
		WHERE username = ?`,
		username,
	);

	if (authProbResult.length == 0)
		return res.status(404).send({ msg: "Could not find user " + username });

	const { fullName, id } = authProbResult[0];

	let authoredProblems;
	if (!authProbResult[0].shortName)
		authoredProblems = [];
	else authoredProblems = authProbResult.map(row => ({
		...row,
		fullName: undefined,
		id: undefined,
	}));

	// Things that care about every submission
	const runtimeResult = await database.query(
		`SELECT
			AVG(max_runtime_ms) AS averageRuntime
		FROM
			account,
			problem,
			submission
		WHERE account.id = ?
		AND submission.account_id = account.id
		AND problem.id = submission.problem_id
		AND account.id != problem.author_id
		AND submission.status = 'accepted'
		GROUP BY account.id`,
		id
	);

	const averageRuntime = runtimeResult.length === 1 ?
		runtimeResult[0].averageRuntime :
		"?";

	// Things that only want one submission per problem
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
		id
	);

	const points = pointsResult[0].points;

	res.send({ username, fullName, authoredProblems, averageRuntime, points });
}
