import database from "../../database.js"
import * as responses from "../../responses.js"

export async function get(req, res) {
	if (!req.token)
		return responses.mustLogin(res);

	const accountResult = await database.query(
		`SELECT username, full_name, email
		FROM account
		WHERE id = ?`,
		req.token.id
	);

	const { username, full_name: fullName, email } = accountResult[0];

	const authProbResult = await database.query(
		`SELECT short_name, long_name
		FROM account, problem
		WHERE account.id = author_id
		AND account.id = ?`,
		req.token.id,
	);

	const authoredProblems = authProbResult
		.map(problem => ({
			shortName: problem.short_name,
			longName: problem.long_name
		}));

	const submissionsResult = await database.query(
		`SELECT short_name, long_name, timestamp, lang, status
		FROM account, problem, submission
		WHERE account.id = ?
		AND submission.account_id = account.id
		AND problem.id = submission.problem_id
		GROUP BY account.id`,
		req.token.id
	);

	console.log(submissionsResult);

	let submissions = submissionsResult
		.map(submission => ({
			problemShortName: submission.short_name,
			problemLongName: submission.long_name,
			timstamp: submission.timstamp,
			lang: submission.lang,
			status: submission.status,
		}));

	res.send({ username, fullName, email, authoredProblems, submissions });
}
