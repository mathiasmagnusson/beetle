<style>
	.wrapper {
		min-height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 200px 0;
	}
	main {
		width: 80%;
		max-width: 700px;
		padding: 20px;
		background-color: white;
		border-radius: 5px;
		box-shadow: 0 0 10px -6px #0008;
	}
	h1 {
		border-bottom: 1px solid #ccc;
		margin-bottom: 20px;
	}
	.grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	button {
		grid-column: 1 / -1;
	}
	.message {
		color: red;
	}
	.success {
		color: green;
	}
</style>

<script>
	import { slide } from "svelte/transition";

	let username = "";
	let email = "";
	let password = "";
	let repeatPassword = "";

	let msgs = [];

	async function submit() {
		msgs = [];

		if (!username) {
			msgs = [...msgs, { txt: "Missing username" }];
		}
		if (!email) {
			msgs = [...msgs, { txt: "Missing email" }];
		}
		if (!password) {
			msgs = [...msgs, { txt: "Missing password" }];
		}
		if (password !== repeatPassword) {
			msgs = [...msgs, { txt: "Passwords don't match" }];
		}

		if (msgs.length) return;

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

		if (res.status === 200) {
			return msgs = [...msgs, { txt: json.msg, success: true }];
		} else {
			return msgs = [...msgs, { txt: json.msg }];
		}
	}
</script>

<div class="wrapper">
	<main>
		<h1>Register</h1>
		<div class="grid">
			<label for="username">Username</label>
			<input id="username" type="text" bind:value={username} />
			<label for="email">Email</label>
			<input id="email" type="email" bind:value={email} />
			<label for="password">Password</label>
			<input id="password" type="password" bind:value={password} />
			<label for="repeat-password">Repeat Password</label>
			<input id="repeat-password" type="password" bind:value={repeatPassword} />
			<button on:click={submit}>Log in</button>
		</div>
		{#each msgs as { txt, success } (txt)}
			<p transition:slide|local={{ duration: 200 }} class="message" class:success>{txt}</p>
		{/each}
	</main>
</div>
