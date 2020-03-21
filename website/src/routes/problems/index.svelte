<style>
	.wrapper {
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	main {
		border: 1px solid grey;
		width: 80%;
		padding: 5px;
		font-size: 15px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(7, auto);
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
		const res = await this.fetch("problems.json?count=10");
		const problems = await res.json();
		return { problems };
	}
</script>

<script>
	export let problems;

	let start = 0;
	let count = 10;
	let problemsShown;

	$: {
		problemsShown = `${start}-${start + count}`;
	}

	async function loadProblems() {
		const res = await fetch(`problems.json?start=${start}&count=${count}`);
		problems = await res.json();
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

<div class="wrapper">
	<main>
		<div class="grid">
			<p class="h">Name</p>
			<p class="h" title="Points granted for completing problem">Points</p>
			<p class="h" title="Upvotes">👍</p>
			<p class="h" title="Downvotes">👎</p>
			<p class="h" title="Successes">✔️</p>
			<p class="h" title="Failiures">❌</p>
			<p class="h">Author</p>
			{#each problems as problem, i}
				<a class:hl={i % 2} href="/problems/{problem.shortName}">{problem.longName || problem.shortName}</a>
				<div class:hl={i % 2}>{problem.points}</div>
				<div class:hl={i % 2}>{problem.upvotes}</div>
				<div class:hl={i % 2}>{problem.downvotes}</div>
				<div class:hl={i % 2}>{problem.succeeded}</div>
				<div class:hl={i % 2}>{problem.failed}</div>
				<a class:hl={i % 2} href="/account/{problem.author.username}">{problem.author.fullName || problem.author.username}</a>
			{/each}
		</div>
		<section on:click={loadProblems} class="controls">
			<button on:click={previousPage}>⬅️</button>
			<button on:click={smallerPage}>➖</button>
			<p>{problemsShown}</p>
			<button on:click={biggerPage}>➕</button>
			<button on:click={nextPage}>➡️</button>
		</section>
	</main>
</div>
