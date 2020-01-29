import crypto from "crypto";
// import creds from "./credentials.json";

// const secret = creds["token-secret"];
const secret = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const ivLen = 16;

export function encrypt(data) {
	const str = JSON.stringify(data);

	const iv = crypto.randomBytes(ivLen);
	const cipher = crypto.createCipheriv("aes256", secret, iv);
	return iv.toString("hex") + cipher.update(str, "utf8", "hex") + cipher.final("hex");
}

export function decrypt(token) {
	if (typeof token !== "string" || token.length != 64)
		throw "Incorrect token";

	let iv = Buffer.from(token.substring(0, ivLen * 2), "hex");
	let encypted = token.substring(ivLen * 2);

	const decipher = crypto.createDecipheriv("aes256", secret, iv);
	let str = decipher.update(encypted, "hex", "utf8") + decipher.final("utf8");

	let data = JSON.parse(str);

	return data;
};

