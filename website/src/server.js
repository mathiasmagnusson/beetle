import * as sapper from "@sapper/server";
import compression from "compression";
import creds from "./creds.json";
import database from "./database.js";
import express from "express";
import session from "express-session";
import sessionFileStore from "session-file-store";

const FileStore = sessionFileStore(session);

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === "development";

const app = express();

app.use(
	compression({ threshold: 0 }),
	express.static("static", { dev }),
	session({
		cookie: {
			secure: !dev,
		},
		resave: false,
		saveUninitialized: false,
		secret: creds["cookie-secret"],
		store: new FileStore({
			path: dev ? ".sessions" : "/tmp/beetle-sessions",
		}),
		unset: "destroy",
	}),
	sapper.middleware(),
);

app.listen(PORT, err => {
	if (err) console.log("error", err);
});
