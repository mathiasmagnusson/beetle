import crypto from "crypto";
import onHeaders from "on-headers";
import assert from "assert";

function encrypt(token, ivSize, algorithm, secret) {
	const iv = crypto.randomBytes(ivSize);
	const cipher = crypto.createCipheriv(algorithm, secret, iv);
	const ivStr = iv.toString("hex");
	return ivStr + cipher.update(secret + ivStr + JSON.stringify(token), "utf8", "hex") + cipher.final("hex");
}

function decrypt(token, ivSize, algorithm, secret) {
	try {
		const ivStr = token.substring(0, ivSize * 2);
		const iv = Buffer.from(ivStr, "hex");
		const encypted = token.substring(ivSize * 2);

		const decipher = crypto.createDecipheriv(algorithm, secret, iv);

		const str = decipher.update(encypted, "hex", "utf8")
			+ decipher.final("utf8");

		assert.equal(secret, str.substring(0, secret.length));
		assert.equal(ivStr, str.substring(secret.length, secret.length + ivStr.length));

		return JSON.parse(str.substring(secret.length + ivStr.length));
	}
	catch (err) {
		return null;
	}
}

export default function cryptoken(options) {
	let { secret, ivSize, algorithm, maxAge } = options;

	if (typeof secret !== "string")
		throw new TypeError("secret must be a string");

	if (ivSize && typeof ivSize !== "number")
		throw new TypeError("ivSize must be a number");

	if (algorithm && typeof algorithm !== "string")
		throw new TypeError("algorithm must be a string");

	if (maxAge && typeof maxAge !== "number")
		throw new TypeError("maxAge must be a number");

	if (!ivSize) ivSize = 16;
	if (!algorithm) algorithm = "aes256";

	return function(req, res, next) {
		if ("token" in req) return;

		onHeaders(res, () => {
			if (!"token" in req || typeof req.token !== "object") return;

			let opts = {
				httpOnly: true,
			};

			if (typeof maxAge === "number") {
				opts = {
					...opts,
					maxAge
				};
			}

			res.cookie(
				"token",
				encrypt(req.token, ivSize, algorithm, secret),
				opts
			);
		});

		if ("token" in req.cookies) {
			let token = req.cookies.token;

			if (typeof token !== "string" || token.length <= ivSize * 2)
				return next();

			req.token = decrypt(token, ivSize, algorithm, secret);
		}

		next();
	}
}
