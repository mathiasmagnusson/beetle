import database from "../../database.js";
import depthify from "../../depthify.js";
import * as responses from "../../responses.js";

export async function get(req, res) {
	let { start, count } = req.query;

	start = parseInt(start);
	count = parseInt(count);

	if (isNaN(start)) start = 0;
	if (isNaN(count)) count = 20;

	const problems = await database.query(
		`SELECT
			short_name AS shortName,
			long_name AS longName,
			points,
			COALESCE(upvotes, 0) AS upvotes,
			COALESCE(downvotes, 0) AS downvotes,
			COALESCE(succeeded, 0) AS succeeded,
			COALESCE(failed, 0) AS failed,
			username AS "author.username",
			full_name AS "author.fullName"
		FROM problem
		LEFT JOIN (
			SELECT
				problem_id,
				SUM(type = 'up') AS upvotes,
				SUM(type = 'down') AS downvotes
			FROM vote
			GROUP BY problem_id
		) AS votes
		ON votes.problem_id = problem.id
		LEFT JOIN (
			SELECT
				problem_id,
				SUM(status = 'accepted') AS succeeded,
				SUM(status != 'accepted' AND status != 'pending') AS failed
			FROM submission
			GROUP BY problem_id
		) AS submissions
		ON submissions.problem_id = problem.id
		LEFT JOIN account
		ON problem.author_id = account.id
		LIMIT ?, ?`,
		[start, count]
	);

	res.send(depthify(problems));
}

// Create problem
export async function post(req, res) {
	if (!req.token)
		return responses.mustLogin(res);

	let {
		shortName,
		longName,
		points,
		testingMethod,
		validationScript,
		timeLimit,
		memoryLimit,
		description,
		testCases,
	} = req.body;

	if (typeof shortName !== "string")
		return responses.missingParam(res, "shortName");

	if (typeof points !== "number" || points !== parseInt(points))
		return res.status(400).send({ msg: "points must be an integer" });

	if (typeof testingMethod !== "string")
		return responses.missingParam(res, "testingMethod");

	if (testingMethod !== "run-script" && testingMethod !== "compare-output")
		return res.status(400).send({
			msg: "testingMethod must be either 'run-script' or 'compare-output'"
		});

	if ((testingMethod === "run-script") !==
		(typeof validationScript === "string"))
		return res.status(400).send({
			msg: "if testingMethod is 'run-script', validationScript must be a" +
			"string, otherwise it must not be supplied"
		});

	if (typeof timeLimit !== "number")
		timeLimit = 1000;

	if (timeLimit < 0 ||
		timeLimit > 4000 ||
		timeLimit !== parseInt(timeLimit))
		return res.status(406).send({
			msg: "timeLimit must be a positive integer under or at 4000 (ms)"
		});

	if (typeof memoryLimit !== "number")
		memoryLimit = 1024;

	if (memoryLimit < 0 ||
		memoryLimit > 4096 ||
		memoryLimit !== parseInt(memoryLimit))
		return res.status(406).send({
			msg: "memoryLimit must be a positive integer under or at 4096 (MB)"
		})

	if (typeof description !== "string")
		return responses.missingParam(res, "description");

	if (!(testCases instanceof Array))
		return res.status(400).send({
			msg: "testCases must be an array"
		});

	if (!testCases.every(testCase =>
		typeof testCase.input === "string" &&
		typeof testCase.output === (
			testingMethod === "compare-output" ? "string" : "undefined"
		)
	))
		res.status(400).send({
			msg: "every element in testCases must be an object containing " +
			"input, which should be a string, and if testingMethod is " +
			"'compare-output', output which should also be a string"
		});

	let result;
	try {
		result = await database.query(
			`INSERT INTO problem (
				short_name,
				long_name,
				author_id,
				points,
				testing_method,
				validation_script,
				time_limit_ms,
				memory_limit_mb,
				description
			) VALUES (
				?,
				?,
				?,
				?,
				?,
				?,
				?,
				?,
				?
			)`,
			[
				shortName,
				longName,
				req.token.id,
				points,
				testingMethod,
				validationScript,
				timeLimit,
				memoryLimit,
				description,
			]
		);
	}
	catch (err) {
		if (err.code === "ER_DUP_ENTRY")
			return res.status(402).send({ msg: "Problem name taken" });
	}

	const problem = result.insertId;

	const testCaseResults = await Promise.all(
		testCases.map(testCase => database.query(
			`INSERT INTO test_case (
				problem_id,
				input,
				correct_output
			) VALUES (
				?,
				?,
				?
			)`,
			[problem, testCase.input, testCase.output]
		))
	);

	res.send({ msg: "Problem created" });
}
