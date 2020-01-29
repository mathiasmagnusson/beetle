import crypto from "crypto";
import creds from "./creds.json";

const secret = creds["token-secret"];
const ivByteCount = 16;
const ivCharCount = ivByteCount * 2;

export function encrypt(data) {
	const iv = crypto.randomBytes(ivByteCount);
	const cipher = crypto.createCipheriv("aes256", secret, iv);
	return iv.toString("hex") + cipher.update(JSON.stringify(data), "utf8", "hex") + cipher.final("hex");
}

export function decrypt(token) {
	if (typeof token !== "string" || token.length <= ivCharCount)
		throw "Invalid token";

	let iv = Buffer.from(token.substring(0, ivCharCount), "hex");
	let encypted = token.substring(ivCharCount);

	const decipher = crypto.createDecipheriv("aes256", secret, iv);
	let str = decipher.update(encypted, "hex", "utf8") + decipher.final("utf8");

	let data = JSON.parse(str);

	return data;
};

