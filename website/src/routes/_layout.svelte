<script>
	import Menu from "../components/Menu.svelte";

	export let segment;
</script>

<style>
	div {
		margin-left: 5rem;
		min-height: 100vh;
	}
</style>

<Menu {segment} />

<div>
	<slot></slot>
</div>
