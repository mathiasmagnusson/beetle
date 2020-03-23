<style>
	.wrapper {
		min-height: 100vh;
		padding: 100px 0;
		display: flex;
		justify-content: center;
	}
	main {
		width: 80%;
		max-width: 1000px;
		padding: 20px;
		background-color: white;
		border-radius: 5px;
		box-shadow: 0 0 10px -6px #0008;
	}
	header {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 10px;
	}
	header :global(:last-child) {
		margin-left: auto;
	}
	a {
		color: black;
	}
	span, span a {
		font-size: 22px;
		color: #555;
	}
	.public {
		display: flex;
		align-items: center;
		padding: 5px;
		gap: 8px;
		user-select: none;
	}
	pre {
		padding: 10px;
		border-radius: 5px;
		-moz-tab-size: 4;
		tab-size: 4;
	}
	.info {
		display: flex;
		justify-content: space-between;
	}
	.info .right {
		text-align: right;
	}
	.status {
		display: flex;
		padding: 10px;
	}
	.status > :global(:last-child) {
		margin-left: auto;
		padding: 0;
	}
	.test-cases {
		display: flex;
		flex-wrap: wrap;
		align-content: flex-start;
		gap: 4px;
	}
	.checkbox {
		width: 18px;
		height: 18px;
		background-color: #00000004;
		border: 1px solid #00000028;
		border-radius: 4px;
		position: relative;
	}
	.check {
		position: absolute;
		background-color: #0a0;
		height: 10%;
	}
	.check.a {
		top: 55%;
		left: 5%;
		width: 40%;
		transform: rotate(45deg);
	}
	.check.b {
		top: 45%;
		left: 30%;
		width: 64%;
		transform: rotate(-45deg);
	}
	.cross {
		position: absolute;
		background-color: #a00;
		height: 10%;
		width: 90%;
		top: 45%;
		left: 1%;
	}
	.cross.a {
		transform: rotate(45deg);
	}
	.cross.b {
		transform: rotate(-45deg);
	}
</style>

<script context="module">
	export async function preload({ params, query }) {
		const res = await this.fetch(`/submissions/${params.submission}.json`, {
			credentials: "include"
		});

		if (res.status === 200) {
			const submission = await res.json();
			return { submission };
		}

		let json = await res.json();
		this.error(res.status, json.msg);
	}
</script>

<script>
	import Status from "../../../components/Status.svelte";
	import { message, error } from "../../../util";

	import { onMount } from "svelte";

	export let submission;

	let problemName = submission.problem.longName ||
		submission.problem.shortName;
	let submitterName = submission.submitter.fullName ||
		submission.submitter.username;

	let pre;
	let submissionTime;
	let isPublic = submission.public;

	async function publicChange() {
		const res = await fetch(`${window.location}/set-public.json`, {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				public: Boolean(isPublic),
				gay: "yes please"
			})
		});

		const json = await res.json();

		if (res.status !== 200) {
			isPublic = !isPublic;
			error(json.msg);
		} else {
			message(json.msg);
		}
	}

	$: {
		let date = new Date(submission.timestamp * 1000);
		submissionTime =
			`${
				date.getFullYear()
			}-${
				(date.getMonth() + 1).toString().padStart(2, "0")
			}-${
				date.getDate().toString().padStart(2, "0")
			} ${
				date.getHours().toString().padStart(2, "0")
			}:${
				date.getMinutes().toString().padStart(2, "0")
			}:${
				date.getSeconds().toString().padStart(2, "0")
			}`;
	}

	onMount(() => hljs.highlightBlock(pre));
</script>

<div class="wrapper">
	<main>
		<header>
			<h1><a href="/problems/{submission.problem.shortName}">
				{problemName}
			</a></h1>
			<span>
				- by
				<a href="/account/{submission.submitter.username}">
					{submitterName}
				</a>
			</span>
			<section class="public">
				<label for="public">Public</label>
				{#if submission.requesterIsOwner}
				<input
					id="public"
					type="checkbox"
					bind:checked={isPublic}
					on:change={publicChange}
				/>
				{/if}
			</section>
		</header>
		<section class="info">
			<div>
				<p><strong>Language:</strong> {submission.lang}</p>
				<p><strong>Timestamp:</strong> {submissionTime}</p>
			</div>
			{#if typeof submission.maxRuntime === "number"}
			<div class="right">
				<p><strong>Run time:</strong> {submission.maxRuntime}ms</p>
				<p><strong>Run memory:</strong> {submission.maxMemory}MB</p>
			</div>
			{/if}
		</section>
		<section class="status">
			{#if submission.status !== "compilation-error"
				&& submission.status !== "judge-error"}
			<section class="test-cases">
				{#each Array(submission.testCases.total).fill() as _, i}
					<div class="checkbox">
						{#if i < submission.testCases.succeeded}
							<div class="check a"></div>
							<div class="check b"></div>
						{:else if i == submission.testCases.succeeded &&
							submission.status !== "pending" &&
							submission.status !== "accepted"}
							<div class="cross a"></div>
							<div class="cross b"></div>
						{/if}
					</div>
				{/each}
			</section>
			{/if}
			<Status status={submission.status} />
		</section>
		<pre bind:this={pre}><code>{submission.source}</code></pre>
	</main>
</div>
