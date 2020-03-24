<style>
	.wrapper {
		min-height: 100vh;
		padding: 100px 0;
		display: flex;
		justify-content: center;
	}
	main {
		width: 80%;
		max-width: 1000px;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: auto 1fr auto;
		padding: 20px;
		background-color: white;
		border-radius: 5px;
		box-shadow: 0 0 10px -6px #0008;
	}
	h1 {
		margin-bottom: 10px;
	}
	textarea {
		resize: none;
		width: 100%;
	}
	.flex {
		display: flex;
		margin-top: 10px;
		justify-content: flex-end;
		gap: 10px;
	}
</style>

<script context="module">
	export async function preload({ params }) {
		let res = await this.fetch("/supported-languages.json");
		let supportedLanguages = await res.json();
		let problemName = params.problem;

		return { supportedLanguages, problemName };
	}
</script>

<script>
	import { goto } from "@sapper/app";
	import { error } from "../../../util";

	export let supportedLanguages;
	export let problemName;

	let lang;
	let source = "";

	async function submit() {
		const res = await fetch(`/problems/${problemName}/submit.json`, {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				lang,
				source,
			})
		});

		const json = await res.json();

		if (res.status === 200) {
			const id = json.id;

			return goto(`submissions/${id}`);
		}

		error(json.msg);
	}
</script>

<div class="wrapper">
	<main>
		<h1>Submit</h1>
		<textarea bind:value={source} />
		<div class="flex">
			<select bind:value={lang}>
				{#each Object.entries(supportedLanguages) as [id, { name }]}
					<option value={id}>{name}</option>
				{/each}
			</select>
			<input on:click={submit} type="submit" value="Submit" />
		</div>
	</main>
</div>
