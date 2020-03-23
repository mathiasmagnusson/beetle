<style>
	.wrapper {
		min-height: 100vh;
		padding: 100px 0;
		display: flex;
		justify-content: center;
	}
	main {
		width: 80%;
		padding: 20px;
		max-width: 1300px;
		background-color: white;
		border-radius: 5px;
		box-shadow: 0 0 10px -6px #0008;
		display: flex;
		flex-direction: column;
	}
	h1 {
		border-bottom: 1px solid #ccc;
		margin-bottom: 20px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(7, auto);
	}
	.grid > * {
		padding: 10px;
	}
	.h {
		border-bottom: 1px solid #888;
	}
	.hl {
		background-color: #ddd;
	}
	a {
		text-decoration: none;
	}
	.controls {
		margin-top: auto;
		padding: 10px;
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: 8px;
		background-color: #eee;
	}
	.controls i {
		font-size: 20px;
		color: #888;
	}
	button {
		background: none;
		border: none;
		cursor: pointer;
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
		<h1>Problems</h1>
		<div class="grid">
			<p class="h">Name</p>
			<p class="h" title="Points granted for completing problem">Points</p>
			<p class="h" title="Upvotes">
				<i class="far fa-thumbs-up"></i>
			</p>
			<p class="h" title="Downvotes">
				<i class="far fa-thumbs-down"></i>
			</p>
			<p class="h" title="Successes">
				<i class="fas fa-check"></i>
			</p>
			<p class="h" title="Failiures">
				<i class="fas fa-times"></i>
			</p>
			<p class="h">Author</p>
			{#each problems as problem, i}
				<a class:hl={i % 2} href="/problems/{problem.shortName}">
					{problem.longName || problem.shortName}
				</a>
				<div class:hl={i % 2}>{problem.points}</div>
				<div class:hl={i % 2}>{problem.upvotes}</div>
				<div class:hl={i % 2}>{problem.downvotes}</div>
				<div class:hl={i % 2}>{problem.succeeded}</div>
				<div class:hl={i % 2}>{problem.failed}</div>
				<a class:hl={i % 2} href="/account/{problem.author.username}">
					{problem.author.fullName || problem.author.username}
				</a>
			{/each}
		</div>
		<section on:click={loadProblems} class="controls">
			<button on:click={previousPage}>
				<i class="fas fa-caret-square-left"></i>
			</button>
			<button on:click={smallerPage}>
				<i class="fas fa-minus-square"></i>
			</button>
			<p>{problemsShown}</p>
			<button on:click={biggerPage}>
				<i class="fas fa-plus-square"></i>
			</button>
			<button on:click={nextPage}>
				<i class="fas fa-caret-square-right"></i>
			</button>
		</section>
	</main>
</div>
