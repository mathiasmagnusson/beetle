export async function post(req, res) {
	const wasLoggedIn = Boolean(req.token);
	delete req.token;
	res.clearCookie("token").send({ wasLoggedIn });
}
