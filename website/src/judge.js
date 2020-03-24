import net from "net";
import database from "./database.js";

let socket = net.connect(48753, "127.0.0.1");

socket.on("connect", () => {
	socket.setEncoding("utf8");
});

socket.on("ready", () => {
	console.log("Connection to judge ready");
});

socket.on("data", async data => {
	const packet = JSON.parse(data);
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

export function supportsLang(lang) {
	return Object.keys(supportedLanguages()).includes(lang);
}

export function supportedLanguages() {
	return {
		"c": { name: "C" },
	};
}

export function submit(submission) {
	socket.write(JSON.stringify(submission) + "\n");
}
