import database from "../../database.js"

export async function get(req, res) {
	if (!req.token)
		return res.status(401).send({ msg: "You must log in first" });

	res.send({ gay: "maybe" });
}
