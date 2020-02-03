export function missingParam(res, what) {
	res.status(400).send({ msg: "Missing " + what });
}

export function mustLogin(res) {
	res.status(401).send({ msg: "You must log in first" });
}

export function invalid(res, what) {
	res.status(406).send({ msg: "Invalid " + what })
}
