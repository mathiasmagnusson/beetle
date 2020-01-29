import * as sapper from "@sapper/server";
import compression from "compression";
import cookieParser from "cookie-parser";
import creds from "./creds.json";
import database from "./database.js";
import express from "express";

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const app = express();

app.use(
	compression({ threshold: 0 }),
	express.static("static", { dev }),
	express.json(),
	cookieParser(),
	sapper.middleware(),
);

app.listen(PORT, err => {
	if (err) console.log("error", err);
});
