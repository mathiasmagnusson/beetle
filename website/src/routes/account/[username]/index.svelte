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
	export async function preload({ params }) {
		const res = await this.fetch(`/account/${params.username}.json`);

		if (res.status === 200) {
			const user = await res.json();

			return { user };
		}

		const json = await res.json();
		this.error(res.status, json.msg);
	}
</script>

<script>
	export let user;
</script>

<div class="wrapper">
	<main>
		<header>
			<h1>{user.fullName || user.username}</h1>
		</header>
		<section class="info">
			<p><strong>Points:</strong> {user.points}</p>
			<p><strong>Average runtime:</strong> {user.averageRuntime}</p>
			{#if user.authoredProblems.length > 0}
				<section>
					<h2>Authored problems</h2>
					<ul class="problems">
						{#each user.authoredProblems as problem}
							<li>
								<a href="/problems/{problem.shortName}">
									{problem.longName || problem.shortName}
								</a>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</section>
	</main>
</div>
