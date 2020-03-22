<style>
	.wrapper {
		min-height: 100vh;
		display: grid;
		grid-template-columns: 1fr 3fr 20px 320px 1fr;
		grid-template-rows: 100px 1fr 100px ;
		grid-template-areas: ". . . . ." ". main . aside ." ". . . . .";
	}
	main {
		grid-area: main;
		padding: 20px;
		background-color: white;
		border-radius: 5px;
		box-shadow: 0 0 10px -6px #0008;
	}
	main, section {
		background-color: white;
		border-radius: 5px;
		box-shadow: 0 0 10px -6px #0008;
	}
	h1 {
		border-bottom: 1px solid #ccc;
		margin-bottom: 20px;
	}
	aside {
		grid-area: aside;
	}
	section:not(last-child) {
		margin-bottom: 20px;
	}
	section {
		padding: 14px;
	}
	.button-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 16px;
	}
	aside h2 {
		font-size: 1.1rem;
	}
</style>

<script context="module">
	export async function preload({ params }) {
		const res = await this.fetch(`problems/${params.problem}.json`, {
			credentials: "include"
		});
		let problem = {
			shortName: params.problem,
			...await res.json(),
		};
		return { problem };
	}
</script>

<script>
	import ColorButton from "../../../components/ColorButton.svelte";
	import PieChart from "../../../components/PieChart.svelte";
	import { error } from "../../../message-store.js";
	import { goto } from "@sapper/app";

	export let problem;

	function statusToColor(status) {
		switch (status) {
			case 'accepted': return "#55b369";
			case 'wrong-answer': return "#cc2929";
			case 'runtime-error': return "#db7d35";
			case 'compilation-error': return "#cf4e91";
			case 'time-limit-exceeded': return "#2d92b7";
			case 'memory-limit-exceeded': return "#cbd352";
		}
	}

	let pieChartData = problem
		.statusDistribution
		.map(({ count, status }) => ({
			value: count, title: status, color: statusToColor(status)
		}));

	async function vote(type) {
		let reset = type === problem.userVote;

		const res = await fetch(`problems/${problem.shortName}/vote.json`, {
			method: "post",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				type: reset ? "reset" : type,
			})
		});

		const json = await res.json();

		if (res.status === 200) {
			if (reset) problem.userVote = null;
			else problem.userVote = type;
		} else {
			error(json.msg);
		}

		if (typeof json.upvotes === "number")
			problem.upvotes = json.upvotes;
		if (typeof json.downvotes === "number")
			problem.downvotes = json.downvotes;
	}
</script>

<div class="wrapper">
	<main>
		<h1>{problem.longName || problem.shortName}</h1>
		<article class="description">
			{@html problem.description}
		</article>
	</main>
	<aside>
		<section>
			<div class="button-row">
				<ColorButton
					bg="#4090ff"
					onclick={() => goto(`${window.location}/submit`)}
				>
					Submit
					<i class="fas fa-file-import"></i>
				</ColorButton>
				<ColorButton bg="#20d860" onclick={() => vote("up")}>
					{problem.upvotes}
					{#if problem.userVote === "up"}
						<i class="fas fa-thumbs-up"></i>
					{:else}
						<i class="far fa-thumbs-up"></i>
					{/if}
				</ColorButton>
				<ColorButton bg="#d82020" onclick={() => vote("down")}>
					{problem.downvotes}
					{#if problem.userVote === "down"}
						<i class="fas fa-thumbs-down"></i>
					{:else}
						<i class="far fa-thumbs-down"></i>
					{/if}
				</ColorButton>
			</div>
			<h2>Submission status distribution:</h2>
			<PieChart data={pieChartData} />
			<h2>Average resource usage:</h2>
			<p><strong>Time:</strong> {problem.averageResourceUsage.time}ms</p>
			<p><strong>Memory:</strong> {problem.averageResourceUsage.memory}MB</p>
		</section>
		<section>
			<p><strong>Problem id:</strong> {problem.shortName}</p>
			<p>
				<strong>Author:</strong>
				<a href="/account/{problem.author.username}">
					{problem.author.fullName || problem.author.username}
				</a>
			</p>
			<p><strong>Time limit:</strong> {problem.timeLimit}ms</p>
			<p><strong>Memory limit:</strong> {problem.memoryLimit}MB</p>
			<p><strong>Points: </strong> {problem.points}</p>
		</section>
	</aside>
</div>
