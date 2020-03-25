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
	import { loggedIn } from "../util";
	import { goto } from "@sapper/app";

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
		} catch (err) {
			return msgs = [...msgs, { txt: "Invalid server response" }];
		}

		if (res.status === 200) {
			msgs = [...msgs, { txt: json.msg, success: true }];
			setTimeout(() => goto("/"), 200);
			loggedIn.set(true);
		} else {
			msgs = [...msgs, { txt: json.msg }];
		}
	}
</script>

<div class="wrapper">
	<main>
		<h1>Log in</h1>
		<div class="grid">
			<label for="username">Username</label>
			<input id="username" type="text" bind:value={username} />
			<label for="password">Password</label>
			<input id="password" type="password" bind:value={password} />
			<button on:click={submit}>Log in</button>
			<p>
				New to beetle?
				<a href="/register">Register an account here!</a>
			</p>
		</div>
		{#each msgs as { txt, success } (txt)}
			<p transition:slide|local={{ duration: 200 }} class="message" class:success>{txt}</p>
		{/each}
	</main>
</div>
