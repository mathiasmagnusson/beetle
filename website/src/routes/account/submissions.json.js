import database from "../../database.js"
import * as responses from "../../responses.js"

export async function get(req, res) {
	if (!req.token)
		return responses.mustLogin(res);

	const submissionsResult = await database.query(
		`SELECT
			submission.id AS submission_id,
			short_name,
			long_name,
			timestamp,
			lang,
			status,
			max_runtime_ms,
			max_memory_mb,
			test_cases_succeeded
		FROM submission, problem
		WHERE submission.account_id = ?
		AND submission.problem_id = problem.id`,
		req.token.id
	);

	const submissions = submissionsResult.map(row => ({
		id: row.submission_id,
		problem: {
			shortName: row.short_name,
			longName: row.long_name,
		},
		timestamp: row.timestamp,
		lang: row.lang,
		status: row.status,
		maxRuntime: row.max_runtime_ms,
		maxMemory: row.max_memory_mb,
		testCasesSucceeded: row.test_cases_succeeded,
	}));

	res.send({ submissions });
}
