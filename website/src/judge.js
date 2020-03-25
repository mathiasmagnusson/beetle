import net from "net";
import database from "./database.js";

let socket = net.connect(48753, "127.0.0.1");

socket.on("error", () => {
	console.error("Could not connect to judge");
});

socket.on("connect", () => {
	socket.setEncoding("utf8");
});

socket.on("ready", () => {
	console.log("Connection to judge ready");
});

socket.on("data", async data => {
	let packet;
	try {
		packet = JSON.parse(data);
	}
	catch (err) {
		return console.error("Invalid json package received from judge:", data);
	}
	if (packet.type === "error") return console.error(packet.msg);

	const { id, testCasesSuceeded, status, maxTime, maxMemory } = packet;

	let kebabStatus =
		status === "wrongAnswer" ? "wrong-answer" :
		status === "runtimeError" ? "runtime-error" :
		status === "compilationError" ? "compilation-error" :
		status === "timeLimitExceeded" ? "time-limit-exceeded" :
		status === "memoryLimitExceeded" ? "memory-limit-exceeded" :
		status;

	const result = await database.query(
		`UPDATE submission
		SET
			test_cases_succeeded = ?,
			status = ?,
			max_runtime_ms = ?,
			max_memory_mb = ?
		WHERE
			id = ?`,
		[
			testCasesSuceeded,
			kebabStatus,
			maxTime,
			maxMemory,
			id,
		]
	);
});

export function langName(lang) {
	let langs = supportedLanguages();
	return lang in langs ? langs[lang].name : "Unsupported language";
}

export function supportsLang(lang) {
	return Object.keys(supportedLanguages()).includes(lang);
}

export function supportedLanguages() {
	return {
		"c": { name: "C" },
		"cc": { name: "C++" },
	};
}

export function submit(submission) {
	if (socket)
		socket.write(JSON.stringify(submission) + "\n");
	else {
		console.error(
			`Not connected to judge. Not submitting ${submission.id}.`
		);
	}
}
