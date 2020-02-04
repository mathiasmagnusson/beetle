import database from "../../database.js"

export async function get(req, res) {
	const { username } = req.params;

	const authProbResult = await database.query(
		`
		SELECT full_name, short_name, long_name
		FROM account
		LEFT JOIN problem
		ON account.id = author_id
		WHERE username = ?
		`,
		username,
	);

	if (authProbResult.length == 0)
		return res.status(404).send({ msg: "Unknown not find user " + username });

	const fullName = authProbResult[0]["full_name"];

	let authoredProblems;
	if (!authProbResult[0]["short_name"])
		authoredProblems = [];
	else
		authoredProblems = authProbResult;

	const pointsResult = await database.query(
		`
		SELECT SUM(points)
		FROM account, problem, submission
		WHERE account.id = ?,
		AND submission.account_id = account.id
		AND problem.id = submission.problem_id
		GROUP BY account.id
		`
	);

	console.log(pointsResult);

	res.send({ username, fullName, authoredProblems });
}
