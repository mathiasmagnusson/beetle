<script>
	import Header from "../components/Header.svelte";
	
	export let segment;
</script>

<style>
</style>

<Header {segment} />

<main>
	<slot></slot>
</main>
