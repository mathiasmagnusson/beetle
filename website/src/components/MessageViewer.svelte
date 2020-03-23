<style>
	ul {
		position: fixed;
		bottom: 0;
		right: 200px;
		width: 300px;
	}
	li {
		color: white;
		padding: 5px 10px;
		margin: 5px;
		border-radius: 5px;
		display: flex;
		justify-content: space-between;
		flex-direction: row;
	}
	button {
		cursor: pointer;
		background: none;
		border: none;
		color: white;
		font-size: inherit;
	}
</style>

<script>
	import { messageStore } from "../util";
	import { onDestroy } from "svelte";
	import { slide } from "svelte/transition";

	let messages = [];
	onDestroy(messageStore.subscribe($messages => {
		messages = $messages;
	}));

	function remove(id) {
		messageStore.update(messages =>
			messages.filter(message => message.id !== id));
	}
</script>

<ul>
	{#each messages as message (message.id)}
		<li transition:slide|local style="background-color: {message.color}">
			<span>{message.text}</span>
			<button on:click={() => remove(message.id)}>
				<i class="fas fa-times"></i>
			</button>
		</li>
	{/each}
</ul>
