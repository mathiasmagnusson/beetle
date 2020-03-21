<style>
	main {
		border: 1px solid grey;
		width: 80%;
		margin-left: 10%;
		margin-top: 80px;
		padding: 5px;
		font-size: 15px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(2, auto);
		padding: 5px;
	}

	.grid > * {
		padding: 10px;
	}

	.h {
		border-bottom: 1px solid grey;
	}

	.hl {
		background-color: #ddd;
	}

	a {
		text-decoration: none;
	}

	.controls {
		padding: 10px;
		display: flex;
		align-items: center;
	}

	.controls > * {
		display: inline-block;
		margin: 5px;
	}
</style>

<script context="module">
	export async function preload({ params, query }) {
		const res = await this.fetch("ranklist.json?count=10");
		const ranklist = await res.json();
		return { ranklist };
	}
</script>

<script>
	export let ranklist;

	let start = 0;
	let count = 10;
	let usersShown;

	$: {
		usersShown = `${start}-${start + count}`;
	}

	async function loadProblems() {
		const res = await fetch(`ranklist.json?start=${start}&count=${count}`);
		ranklist = await res.json();
	}

	function previousPage() {
		start = Math.max(0, start - count);
	}

	function nextPage() {
		start += count;
	}

	function smallerPage() {
		count--;
	}

	function biggerPage() {
		count++;
	}
</script>

<main>
	<div class="grid">
		<p class="h">Name</p>
		<p class="h">Points</p>
		{#each ranklist as user, i}
			<a class:hl={i % 2} href="/account/{user.username}">{user.fullName || user.username}</a>
			<div class:hl={i % 2}>{user.points}</div>
		{/each}
	</div>
	<section on:click={loadProblems} class="controls">
		<button on:click={previousPage}>⬅️</button>
		<button on:click={smallerPage}>➖</button>
		<p>{usersShown}</p>
		<button on:click={biggerPage}>➕</button>
		<button on:click={nextPage}>➡️</button>
	</section>
</main>
