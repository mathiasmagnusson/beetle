import database from "../../../database.js";
import * as responses from "../../../responses.js";

export async function post(req, res) {
	const { type } = req.body;
	const { problem } = req.params;

	if (!req.token)
		return responses.mustLogin(res);

	if (!type)
		return responses.missingParam(res, "type");

	if (type !== "up" && type !== "down" && type !== "reset")
		return res.status(400).send({
			msg: "Vote type must be either 'up', 'down' or 'reset'"
		});

	const problemIds = await database.query(
		"SELECT id FROM problem WHERE short_name = ?",
		problem
	);

	if (problemIds.length === 0)
		return res.send({ msg: "Unknown problem " + problem });

	const problemId = problemIds[0].id;

	const votes = (await database.query(
		`SELECT
			COALESCE(SUM(type = 'up'), 0) AS upvotes,
			COALESCE(SUM(type = 'down'), 0) AS downvotes
		FROM problem
		LEFT JOIN account ON account.id = problem.author_id
		LEFT JOIN vote ON problem.id = vote.problem_id
		WHERE problem.id = ?
		GROUP BY problem.id`,
		problemId
	))[0];

	const selection = await database.query(
		`SELECT id, type AS oldType
		FROM vote
		WHERE problem_id = ?
		AND account_id = ?`,
		[problemId, req.token.id]
	);

	const oldType = selection[0] ? selection[0].oldType : null;

	if (type === "reset") {
		const deleteResult = await database.query(
			`DELETE FROM vote
			WHERE account_id = ?
			AND problem_id = ?`,
			[req.token.id, problemId]
		);

		if (deleteResult.affectedRows === 1) {
			if (oldType) {
				votes[oldType + "votes"]--;
			}

			return res.send({ msg: "Vote removed", ...votes });
		}
		else
			return res.status(402).send({
				msg: "You hadn't voted on this problem"
			});
	}

	if (selection.length === 1) {
		const { id, oldType } = selection[0];
		if (oldType === type) {
			return res.status(402).send({
				msg: `You already ${type}voted this problem`
			});
		}

		const update = await database.query(
			`UPDATE vote
			SET type = ?
			WHERE id = ?`,
			[type, id]
		);

		votes[oldType + "votes"]--;
		votes[type + "votes"]++;

		return res.send({ msg: "Vote changed to " + type, ...votes });
	}

	const insertResult = await database.query(
		`INSERT INTO vote (
			problem_id,
			account_id,
			type
		) VALUES (
			?,
			?,
			?
		)`,
		[problemId, req.token.id, type]
	);

	votes[type + "votes"]++;

	res.send({ msg: "Vote cast", ...votes });
}
