export function get(req, res) {
	res.send(typeof req.token === "object");
}
