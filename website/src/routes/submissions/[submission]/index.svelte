<style>
	main {
		width: 70%;
		margin-left: 15%;
		margin-top: 60px;
	}

	.msg {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 100px;
	}

	.info {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.info div > * {
		margin-bottom: 10px;
	}

	.info a {
		text-decoration: none;
		color: black;
	}
</style>

<script context="module">
	export async function preload({ params, query }) {
		const res = await this.fetch("/submissions/" + params.submission + ".json");

		let submission;
		let msg;

		if (res.status == 200)
			submission = await res.json();
		else
			msg = (await res.json()).msg;

		return { submission, msg };
	}
</script>

<script>
	export let submission;
	export let msg;

	$: console.log(submission);
</script>

{#if msg}
	<section class="msg">
		<h1>
			{msg}
		</h1>
	</section>
{:else if submission}
	<main>
		<section class="info">
			<div>
				<h1><a href="/problems/{submission.problem.shortName}">{submission.problem.longName || submission.problem.shortName}</a></h1>
				<h2><a href="{submission.submitter.username}">{submission.submitter.fullName || submission.submitter.username}</a></h2>
			</div>
			<div>
				<p>{submission.status}</p>
				<p>{submission.timestamp}</p>
			</div>
		</section>
	</main>
{/if}
