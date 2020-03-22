import database from "../../../database.js";
import * as responses from "../../../responses.js";
import * as judge from "../../../judge.js";

export async function post(req, res) {
	if (!req.token)
		return responses.mustLogin(res);

	const { problem } = req.params;
	const { lang, source } = req.body;

	if (!lang)
		return responses.missingParam(res, "lang");

	if (!source)
		return responses.missingParam(res, "source");

	if (!judge.supportsLang(lang))
		return res.status(406).send({ msg: "Unsupported language " + lang });

	const problemData = await database.query(
		`SELECT
			problem.id AS problemId,
			testing_method AS testingMethod,
			validation_script AS validationScript,
			time_limit_ms AS timeLimit,
			memory_limit_mb AS memoryLimit,
			input,
			correct_output AS correctOutput
		FROM problem, test_case
		WHERE short_name = ?
		AND problem_id = problem.id`,
		problem
	);

	if (problemData.length == 0)
		return res.status(404).send({ msg: "Unknown problem " + problem });

	const {
		problemId,
		testingMethod,
		validationScript,
		timeLimit,
		memoryLimit,
	} = problemData[0];

	const testCases = problemData.map(
		({ input, correctOutput }) => ({ input, correctOutput })
	);

	const insertResult = await database.query(
		`INSERT INTO submission (
			problem_id,
			account_id,
			public,
			timestamp,
			lang,
			source,
			status,
			test_cases_succeeded
		)
		VALUES (
			?,
			?,
			false,
			?,
			?,
			?,
			'pending',
			0
		)`, [
			problemId,
			req.token.id,
			Math.floor(Date.now() / 1000),
			lang,
			source,
		]
	);

	if (insertResult.affectedRows === 0)
		return res.status(404).send({ msg: "Unknown problem " + problem });

	const id = insertResult.insertId;

	let submission = testingMethod === "compare-output" ? {
		id,
		lang,
		source,
		timeLimit,
		memoryLimit,
		testCases: {
			compareOutput: testCases.map(
				({ input, correctOutput }) => [input, correctOutput]
			),
		},
	} : {
		id,
		lang,
		source,
		timeLimit,
		memoryLimit,
		testCases: {
			validationScript: {
				script: validationScript,
				inputs: testCases.map(({ input }) => input),
			}
		}
	}

	judge.submit(submission);

	res.send({ id });
}
