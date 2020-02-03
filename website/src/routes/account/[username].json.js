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

	res.send({ username, fullName, authoredProblems });
}
