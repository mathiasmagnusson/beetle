import { writable } from "svelte/store";

let idCounter = 0;

export let store = writable([]);

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
	store.update(messages => [
		...messages,
		{ text, color, id },
	]);
	setTimeout(() => {
		store.update(messages => messages.filter(message => message.id !== id));
	}, 3000);
}
