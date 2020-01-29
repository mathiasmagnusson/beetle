<style>
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

<label for="username">Username</label>
<input id="username" type="text" bind:value={username} />
<br />
<label for="password">Password</label>
<input id="password" type="password" bind:value={password} />
<button on:click={submit}>Log in</button>

