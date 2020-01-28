<script context="module">
	export async function preload({ params, query }) {
		const res = await this.fetch("problems.json");
		const problems = await res.json();
		console.log("hej");
		return { problems };
	}
</script>

<script>
	export let problems;
</script>

<style>
</style>

<ul>
	{#each problems as problem}
		<li>{problem}</li>
	{/each}
</ul>
