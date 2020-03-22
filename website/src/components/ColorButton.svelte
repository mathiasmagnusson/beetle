<style>
	a {
		position: relative;
		left: -1px;
		top: -2px;
		display: inline-block;
		padding: 0.4em 1.3em;
		color: white;
		background-color: var(--bg);
		border-radius: 0.3em;
		box-shadow: 1px 2px 0 0 #444;
		user-select: none;
		transition: 0.1s ease-in-out;
		cursor: pointer;
	}
	a:hover {
		left: 0;
		top: 0;
		box-shadow: 0 0 0 0 #444;
	}
	a :global(i) {
		margin-left: 5px;
	}
</style>

<script>
	export let bg;
	export let onclick = () => {};
</script>

<a
	style="--bg: {bg}"
	on:click={onclick}
>
	<slot></slot>
</a>
