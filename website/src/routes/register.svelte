<style>
</style>

<script>
	let username = "";
	let email = "";
	let password = "";
	let repeatPassword = "";

	async function submit() {
		if (!username ||
			!email ||
			!password ||
			password !== repeatPassword) return;

		const res = await fetch("/register.json", {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username,
				email,
				password
			}),
		});

		const json = await res.json();

		console.log(json);
	}
</script>

<h1>Register</h1>
<label for="username">Username</label>
<input id="username" type="text" bind:value={username} />
<br />
<label for="email">Email</label>
<input id="email" type="email" bind:value={email} />
<br />
<label for="password">Password</label>
<input id="password" type="password" bind:value={password} />
<br />
<label for="repeat-password">Repeat Password</label>
<input id="repeat-password" type="password" bind:value={repeatPassword} />
<br />
<button on:click={submit}>Log in</button>
<br />
<a href="/register">Register</a>

