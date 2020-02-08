import database from "../../../database.js";
import * as responses from "../../../responses.js";
import judge from "../../../judge.js";

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

	const submission = await database.query(
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
		SELECT
			id,
			?,
			false,
			?,
			?,
			?,
			'pending',
			0
		FROM problem
		WHERE short_name = ?`,
		[
			req.token.id,
			Math.floor(Date.now() / 1000),
			lang,
			source,
			problem,
		]
	);

	if (submission.affectedRows === 0)
		return res.status(404).send({ msg: "Unknown problem " + problem });

	const id = submission.insertId;

	judge.submit(id, lang, source);

	res.send({ id });
}
