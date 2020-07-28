import * as sapper from "@sapper/server";
import compression from "compression";
import cookieParser from "cookie-parser";
import creds from "./creds.json";
import express from "express";
import cryptoken from "./cryptoken.js";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const app = express();

app.use(
	compression({ threshold: 0 }),
	express.static("static", { dev }),
	express.json(),
	cookieParser(),
	cryptoken({
		algorithm: "sha512",
		keys: creds.keys,
		maxAge: 60 * 60 * 1000,
		randSize: 16,
	}),
	sapper.middleware({
		session: (req, res) => ({
			lang: req.headers["accept-language"]
		})
	}),
);

app.listen(PORT, err => err && console.log("error", err) );
