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
		grid-template-columns: repeat(5, auto);
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
</style>

<script context="module">
	export async function preload({ params, query }) {
		const res = await this.fetch("submissions.json", {
			credentials: "include"
		});

		if (res.status === 200) {
			const submissions = await res.json();
			return { submissions };
		}

		const json = await res.json();

		this.error(res.status, json.msg);
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

<div class="wrapper">
	<main>
		<h1>Your submissions</h1>
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
</div>
