<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		height: calc(100vh - 60px);
	}
	h1 {
		margin-bottom: 20px;
	}
	section {
		width: 60%;
		max-width: 600px;
	}
	.grid-wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
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
	let password = "";

	let msgs = [];

	async function submit() {
		msgs = [];

		if (!username) {
			msgs = [...msgs, { txt: "Missing username" }];
		}
		if (!password) {
			msgs = [...msgs, { txt: "Missing password" }];
		}

		if (msgs.length) return;

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

		let json;
		try {
			json = await res.json();
		}
		catch (err) {
			return msgs = [...msgs, { txt: "Invalid server response" }];
		}

		if (res.status != 200)
			return msgs = [...msgs, { txt: json.msg }];
		else if (json.msg) {
			msgs = [...msgs, { txt: json.msg, success: true }];
			setTimeout(() => window.location.href = "/", 200);
		}
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
		{#each msgs as { txt, success } (txt)}
			<p transition:slide|local={{ duration: 200 }} class="message" class:success>{txt}</p>
		{/each}
	</section>
</main>
