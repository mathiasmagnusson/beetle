import * as tokens from "../tokens.js";

export function post(req, res) {
	const { username, password } = req.body;

	if (!username || !password)
		return res.status(400).send({ msg: "Missing username/password" });

	if (username != "mathias" || password != "mathias")
		return res.status(401).send({ msg: "Invalid username/password" });

	const token = tokens.encrypt({
		aid: 1
	});

	res
		.cookie("token", token, {
			expires: new Date(Date.now() + 8 * 60 * 60 * 1000),
			httpOnly: true,
		})
		.send({
			msg: "Logged in",
		});
}
