import { supportedLanguages } from "../judge.js";

export function get(req, res) {
	res.send(supportedLanguages());
}
