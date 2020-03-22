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
	a {
		cursor: pointer;
	}
</style>

<script>
	import { store } from "../message-store";
	import { onDestroy } from "svelte";
	import { slide } from "svelte/transition";

	let messages = [];
	onDestroy(store.subscribe($messages => {
		messages = $messages;
	}));

	function remove(id) {
		store.update(messages => messages.filter(message => message.id !== id));
	}
</script>

<ul>
	{#each messages as message (message.id)}
		<li transition:slide|local style="background-color: {message.color}">
			<span>{message.text}</span>
			<a on:click={() => remove(message.id)}>
				<i class="fas fa-times"></i>
			</a>
		</li>
	{/each}
</ul>
