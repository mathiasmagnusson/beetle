import crypto from "crypto";
import onHeaders from "on-headers";
import assert from "assert";

function encrypt(token, ivSize, algorithm, secret) {
	const iv = crypto.randomBytes(ivSize);
	const cipher = crypto.createCipheriv(algorithm, secret, iv);
	const ivStr = iv.toString("hex");
	const plaintext = `${Date.now()}:${secret}:${ivStr}:${Buffer.from(JSON.stringify(token)).toString("base64")}`;
	console.log("Encrypting", plaintext);
	return ivStr + cipher.update(plaintext, "utf8", "hex") + cipher.final("hex");
}

function decrypt(token, ivSize, algorithm, secret, maxAge) {
	try {
		const ivStr = token.substring(0, ivSize * 2);
		const iv = Buffer.from(ivStr, "hex");
		const encyptedToken = token.substring(ivSize * 2);

		const decipher = crypto.createDecipheriv(algorithm, secret, iv);
		const str = decipher.update(encyptedToken, "hex", "utf8")
			+ decipher.final("utf8");

		console.log("Decrypted", str);

		const split = str.split(":");
		const creationDate = split.shift();
		const secretCheck = split.shift();
		const ivCheck = split.shift();
		const data = split.shift();

		const age = Date.now() - creationDate;
		assert.equal(secret, secretCheck);
		assert.equal(ivStr, ivCheck);

		return JSON.parse(Buffer.from(data, "base64").toString());
	}
	catch (err) {
		console.log(err);
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

	if (typeof maxAge !== "number")
		throw new TypeError("maxAge must be a number");

	if (!ivSize) ivSize = 16;
	if (!algorithm) algorithm = "aes256";

	return function(req, res, next) {
		if ("token" in req) return;

		onHeaders(res, () => {
			if (!"token" in req || typeof req.token !== "object") return;

			res.cookie("token", encrypt(req.token, ivSize, algorithm, secret), {
				httpOnly: true,
				maxAge,
			});
		});

		if ("token" in req.cookies) {
			let token = req.cookies.token;

			if (typeof token !== "string" || token.length <= ivSize * 2)
				return next();

			req.token = decrypt(token, ivSize, algorithm, secret, maxAge);
		}

		next();
	}
}
