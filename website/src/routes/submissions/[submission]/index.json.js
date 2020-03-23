import database from "../../../database.js";
import * as responses from "../../../responses.js";
import depthify from "../../../depthify.js";

export async function get(req, res) {
	const { submission } = req.params;

	const accountId = req.token ? req.token.id : -1;

	const result = await database.query(
		`SELECT
			account_id AS accountId,
			username AS "submitter.username",
			full_name AS "submitter.fullName",
			problem.short_name AS "problem.shortName",
			problem.long_name AS "problem.longName",
			public,
			timestamp,
			lang,
			source,
			status,
			max_runtime_ms AS maxRuntime,
			max_memory_mb AS maxMemory,
			test_cases_succeeded AS "testCases.succeeded",
			COUNT(test_case.id) AS "testCases.total",
			account_id = ? AS requesterIsOwner
		FROM submission, problem, account, test_case
		WHERE submission.id = ?
		AND submission.problem_id = problem.id
		AND submission.account_id = account.id
		AND test_case.problem_id = problem.id
		GROUP BY submission.id`,
		[accountId, submission]
	);

	if (result.length === 0)
		return res.status(404).send({ msg: "Unknown submission" });

	if (!result[0].public && result[0].accountId !== accountId)
		return res.status(403).send({
			msg: "You dont have access to this submission"
		});

	res.send(depthify({ ...result[0], accountId: undefined }));
}
