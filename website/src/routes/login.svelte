<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}
	section {
		width: 80%;
		max-width: 800px;
	}
	.grid-wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
</style>

<script>
	let username = "";
	let password = "";

	async function submit() {
		const res = await fetch("/login.json", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				password,
			}),
		});

		const json = await res.json();

		console.log(json);
	}
</script>

<main>
	<section>
		<h1>Log in</h1>
		<div class="grid-wrapper">
			<label for="username">Username</label>
			<input id="username" type="text" bind:value={username} />
			<label for="password">Password</label>
			<input id="password" type="password" bind:value={password} />
			<a href="/register">Register</a>
			<button on:click={submit}>Log in</button>
		</div>
	</section>
</main>
