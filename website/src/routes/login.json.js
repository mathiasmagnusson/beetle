import * as tokens from "../tokens.js";

console.log(tokens.decrypt(tokens.encrypt({ "hej": 1 })));

export function post(req, res) {
	const { username, password } = req.body;

	if (!username || !password)
		return res.status(400).send();

	if (username != "mathias" || password != "foodelevator")
		return res.status(401).send();

	let aid = 1;



	res.send();
}
