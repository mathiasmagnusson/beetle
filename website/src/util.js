import { writable } from "svelte/store";

export function statusToColor(status) {
	switch (status) {
		case 'accepted': return "#55b369";
		case 'wrong-answer': return "#cc2929";
		case 'runtime-error': return "#db7d35";
		case 'compilation-error': return "#cf4e91";
		case 'time-limit-exceeded': return "#2d92b7";
		case 'memory-limit-exceeded': return "#cbd352";
	}
}

let idCounter = 0;

export let messageStore = writable([]);

export function error(text) {
	add(text, "#cc2929");
}

export function warning(text) {
	add(text, "#ffa500");
}

export function message(text) {
	add(text, "#55b369");
}

function add(text, color) {
	let id = idCounter++;
	messageStore.update(messages => [
		...messages,
		{ text, color, id },
	]);
	setTimeout(() => {
		messageStore.update(messages =>
			messages.filter(message => message.id !== id));
	}, 3000);
}
