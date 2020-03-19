import crypto from "crypto";
import onHeaders from "on-headers";
import assert from "assert";

// Feistel cipher
export function encrypt(token, algorithm, keys, randSize) {
	const rand = crypto.randomBytes(randSize);

	let date = Date.now().toString();
	let payload = Buffer.from(JSON.stringify(token));

	let data = Buffer.concat([
		rand,
		Buffer.from(date),
		Buffer.from([0]),
		payload,
	]);

	if (data.length % 2) {
		data = Buffer.concat([data, Buffer.from([0])]);
	}

	let l = data.slice(0, data.length / 2);
	let r = data.slice(data.length / 2, data.length);
	for (const key of keys.slice(0, keys.length - 1)) {
		let nl = r;
		let f = crypto
			.createHash(algorithm)
			.update(Buffer.concat([Buffer.from(key), r]))
			.digest();
		let nr = l.map((byte, i) => byte ^ f[i % f.length]);
		l = nl;
		r = nr;
	}

	let f = crypto
		.createHash(algorithm)
		.update(Buffer.concat([Buffer.from(keys[keys.length - 1]), r]))
		.digest();
	l = l.map((byte, i) => byte ^ f[i % f.length]);
	r = r;

	let res = Buffer.concat([rand, l, r]).toString("hex");
	return res;
}

// Feistel cipher
export function decrypt(token, algorithm, keys, randSize, maxAge) {
	try {
		let buffer = Buffer.from(token, "hex");
		let rand = buffer.slice(0, randSize);
		let rest = buffer.slice(randSize);
		let l = rest.slice(0, rest.length / 2);
		let r = rest.slice(rest.length / 2, rest.length);

		for (const key of keys.slice(1).reverse()) {
			let nl = r;
			let f = crypto
				.createHash(algorithm)
				.update(Buffer.concat([Buffer.from(key), r]))
				.digest();
			let nr = l.map((byte, i) => byte ^ f[i % f.length]);
			l = nl;
			r = nr;
		}

		let f = crypto
			.createHash(algorithm)
			.update(Buffer.concat([Buffer.from(keys[0]), r]))
			.digest();
		l = l.map((byte, i) => byte ^ f[i % f.length]);
		r = r;

		let data = Buffer.concat([l, r]);
		if (data[data.length - 1] == 0) {
			data = data.slice(0, data.length - 1);
		}
		const newRand = data.slice(0, randSize);
		if (!rand.equals(newRand)) throw new Error("Invalid rand");
		let mid = data.indexOf(0, randSize);
		let time = data.slice(randSize, mid);
		assert(Date.now() - time <= maxAge * 1000);
		let payload = data.slice(mid + 1);
		return JSON.parse(payload.toString());
	}
	catch (err) {
		console.log(err);
		return null;
	}
}

export default function cryptoken(options) {
	let { keys, algorithm, randSize, maxAge } = options;

	if (algorithm == null) algorithm = "sha512";
	if (randSize == null) randSize = 16;

	if (!(keys instanceof Array))
		throw new TypeError("keys must be an array");

	if (!keys.every(key => typeof key === "string"))
		throw new TypeError("all keys must be strings");

	if (algorithm && typeof algorithm !== "string")
		throw new TypeError("algorithm must be a string");

	if (typeof randSize !== "number")
		throw new TypeError("randSize must be a number");

	if (typeof maxAge !== "number")
		throw new TypeError("maxAge must be a number");

	return function(req, res, next) {
		if ("token" in req) return;

		onHeaders(res, () => {
			if (!"token" in req || typeof req.token !== "object") return;

			res.cookie("token", encrypt(req.token, algorithm, keys, randSize), {
				httpOnly: true,
				maxAge,
			});
		});

		if ("token" in req.cookies) {
			let token = req.cookies.token;

			if (typeof token !== "string" || token.length <= randSize + 1)
				return next();

			req.token = decrypt(token, algorithm, keys, randSize, maxAge);
		}

		next();
	}
}
