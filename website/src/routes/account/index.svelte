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
	.settings {
		margin: 20px 0;
	}
	.settings div {
		display: flex;
		align-items: center;
		padding: 5px;
	}
	.settings label, .settings input {
		margin-right: 10px;
	}
	.settings button {
		padding: 4px;
	}
	.problems {
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		margin-bottom: 10px;
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
	import { error, message, warning, loggedIn } from "../../util";
	import { goto } from "@sapper/app";

	export let account;

	let newEmail = "";
	let newPassword = "";
	let repPassword = "";
	let oldPassword = "";

	async function logout() {
		const res = await fetch(`${window.location}/logout.json`, { method: "post" });

		const json = await res.json();

		loggedIn.set(false);

		if (json.wasLoggedIn) {
			message("Logged out");
			goto("/");
		} else {
			warning("You must be logged in to log out");
			goto("/");
		}
	}

	async function submit() {
		if (!oldPassword)
			return error("Missing old password");

		if (newEmail.trim()) {
			console.log("hej");

			const res = await fetch(`${window.location}/change-email.json`, {
				method: "post",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					password: oldPassword,
					email: newEmail.trim(),
				})
			});

			console.log("hej");

			const json = await res.json();

			if (res.status === 200) {
				message(json.msg);
				account.email = newEmail;
				newEmail = "";
			} else {
				return error(json.msg);
			}
		}

		if (newPassword) {
			if (newPassword !== repPassword)
				return error(
					"'Change password' and 'Repeat password' don't match"
				);

			const res = await fetch(`${window.location}/change-password.json`, {
				method: "post",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					oldPassword,
					newPassword,
				})
			});

			const json = await res.json();

			if (res.status === 200) {
				message(json.msg);
				newPassword = "";
				repPassword = "";
			} else {
				return error(json.msg);
			}
		}

		oldPassword = "";
	}
</script>

<div class="wrapper">
	<main>
		<h1>Account</h1>
		<p><strong>Username:</strong> {account.username}</p>
		<p><strong>Full name:</strong> {account.fullName || "<not set>"}</p>
		<p><strong>Email:</strong> {account.email || "<not set>"}</p>
		<p><strong>Points:</strong> {account.points}</p>
		<section class="settings">
			<h2>Settings</h2>
			<div>
				<label for="email">Change Email</label>
				<input
					id="email"
					type="email"
					placeholder={account.email}
					bind:value={newEmail}
				/>
			</div>
			<div>
				<label for="password">Change password</label>
				<input
					id="password"
					type="password"
					placeholder="************"
					bind:value={newPassword}
				/>
			</div>
			<div>
				<label for="rep-password">Repeat password</label>
				<input
					id="rep-password"
					type="password"
					placeholder="************"
					bind:value={repPassword}
				/>
			</div>
			<br />
			<div>
				<label for="old-password">Old password</label>
				<input
					id="old-password"
					type="password"
					placeholder="************"
					bind:value={oldPassword}
				/>
				<button on:click={submit}>Update</button>
			</div>
			<br />
			<div>
				<button on:click={logout}>Log Out</button>
			</div>
		</section>
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
				You have not (yet) created any problems.
			{/if}
			<button on:click={() => goto("/problems/create-new")}>Create a problem</button>
		</section>
	</main>
</div>
