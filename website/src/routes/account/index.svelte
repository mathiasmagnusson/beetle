<style>
	.wrapper {
		min-height: 100vh;
		display: flex;
		justify-content: center;
		padding: 200px 0;
	}
	main {
		width: 80%;
		max-width: 1000px;
		padding: 20px;
		background-color: white;
		border-radius: 5px;
		box-shadow: 0 0 10px -6px #0008;
	}
	h1 {
		border-bottom: 1px solid #ccc;
		margin-bottom: 20px;
	}
	h2 {
		border-bottom: 1px solid #ddd;
		margin: 20px 0 10px 0;
	}
	.problems {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
	}
</style>

<script context="module">
	export async function preload() {
		const res = await this.fetch("/account.json", {
			credentials: "include"
		});

		if (res.status === 200) {
			const account = await res.json();
			return { account };
		}

		let json = await res.json();
		this.error(res.status, json.msg);
	}
</script>

<script>
	export let account;
</script>

<div class="wrapper">
	<main>
		<h1>Account Settings</h1>
		<p><strong>Username:</strong> {account.username}</p>
		<p><strong>Full name:</strong> {account.fullName || "<not set>"}</p>
		<p><strong>Email:</strong> {account.email || "<not set>"}</p>
		<p><strong>Points:</strong> {account.points}</p>
		<section>
			<h2>Authored problems</h2>
			{#if account.authoredProblems.length > 0}
				<ul class="problems">
					{#each account.authoredProblems as problem}
						<li>
							<a href="/problems/{problem.shortName}">
								{problem.longName || problem.shortName}
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				You have not created any problems
			{/if}
		</section>
	</main>
</div>
