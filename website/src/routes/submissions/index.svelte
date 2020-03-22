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
		grid-template-columns: repeat(5, auto);
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
</style>

<script context="module">
	import { warning } from "../../message-store.js";

	export async function preload({ params, query }) {
		const res = await this.fetch("submissions.json", {
			credentials: 'include'
		});

		if (res.status == 401) {
			warning("You must log in first");
			this.redirect(302, "/login");
		}

		const submissions = await res.json();
		return { submissions };
	}
</script>

<script>
	import Status from "../../components/Status.svelte";
	export let submissions;

	function timeFormat(timestamp) {
		const d = new Date(timestamp * 1000);
		return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()} ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
	}
</script>

<main>
	<div class="grid">
		<p class="h">Problem</p>
		<p class="h">ID</p>
		<p class="h">Submission time</p>
		<p class="h">Status</p>
		<p class="h">Langugage</p>
		{#each submissions as sbm, i}
			<a class:hl={i % 2} href="/problems/{sbm.problem.shortName}">{sbm.problem.longName || sbm.problem.shortName}</a>
			<a class:hl={i % 2} href="/submissions/{sbm.id}">{sbm.id}</a>
			<div class:hl={i % 2}>{timeFormat(sbm.timestamp)}</div>
			<Status hl={i % 2} status={sbm.status} />
			<div class:hl={i % 2}>{sbm.lang}</div>
		{/each}
	</div>
</main>
