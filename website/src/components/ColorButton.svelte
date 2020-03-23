<style>
	button {
		position: relative;
		left: -1px;
		top: -2px;
		display: inline-block;
		font-size: inherit;
		padding: 3% 7%;
		color: white;
		background-color: var(--bg);
		border-radius: 0.3em;
		box-shadow: 1px 2px 0 0 #444;
		user-select: none;
		transition: 0.1s ease-in-out;
		cursor: pointer;
		border: none;
	}
	button:hover {
		left: 0;
		top: 0;
		box-shadow: 0 0 0 0 #444;
	}
	button :global(i) {
		margin-left: 5px;
	}
</style>

<script>
	export let bg;
	export let onclick = () => {};
</script>

<button
	style="--bg: {bg}"
	on:click={onclick}
>
	<slot></slot>
</button>
