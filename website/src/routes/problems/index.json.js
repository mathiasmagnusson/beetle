const problems = [
	"a",
	"b",
	"c",
];

export function get(req, res) {
	res
		.status(200)
		.send(problems);
}
