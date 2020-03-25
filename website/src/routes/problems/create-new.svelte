<style>
	.wrapper {
		min-height: 100vh;
		padding: 100px 0;
		display: flex;
		justify-content: center;
	}
	main {
		width: 80%;
		padding: 20px;
		max-width: 1300px;
		background-color: white;
		border-radius: 5px;
		box-shadow: 0 0 10px -6px #0008;
		display: flex;
		flex-direction: column;
		gap: 5px;
	}
	h1 {
		border-bottom: 1px solid #ccc;
		margin-bottom: 20px;
	}
	.test-case {
		border-radius: 5px;
		background-color: #eee;
		padding: 5px;
		margin: 5px;
	}
	article {
		margin: 0;
		border-radius: 5px;
		border: 5px solid #eee;
		padding: 20px;
	}
</style>

<script>
	import { error, message } from "../../util";
	import { goto } from "@sapper/app";

	let shortName = "";
	let longName = "";
	let points = 1;
	let testingMethod = "compare-output";
	let validationScript = "";
	let timeLimit = 1000;
	let memoryLimit = 1024;
	let description = "";
	let testCases = [];
	let saneDescription = "";

	let testCaseId = 0;
	function addTestCase() {
		testCases = [
			...testCases,
			{
				id: testCaseId++,
				input: "",
				output: "",
			}
		];
	}

	function removeTestCase(id) {
		testCases = testCases.filter(tc => tc.id !== id);
	}

	async function updateSaneDescription() {
		const res = await fetch(
			`/problems/create-new.json?description=${description}`
		);

		const json = await res.json();

		saneDescription = description;
	}

	async function submit() {
		const res = await fetch(`${window.location}.json`, {
			method: "post",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				shortName,
				longName,
				points,
				testingMethod,
				validationScript,
				timeLimit,
				memoryLimit,
				description,
				testCases,
			})
		});

		const json = await res.json();

		if (res.status === 200) {
			message(json.msg);
			goto(`/problems/${json.shortName}`);
		} else {
			error(json.msg);
		}
	}
</script>

<div class="wrapper">
	<main>
		<h1>Create problem</h1>

		<div>
			<label for="shortName">Short name:</label>
			<input id="shortName" type="text" bind:value={shortName} />
		</div>
		<div>
			<label for="longName">Long name:</label>
			<input id="longName" type="text" bind:value={longName} />
		</div>
		<div>
			<label for="points">Points:</label>
			<input id="points" type="number" min={1} max={10} bind:value={points} />
		</div>
		<div>
			<label for="testing-method">Testing method:</label>
			<select id="testing-method" disabled={true} bind:value={testingMethod}>
				<option value="compare-output">Compare output</option>
				<option value="run-script">Run script</option>
			</select>
		</div>
		<div>
			<label for="time-limit">Time limit:</label>
			<input
				id="time-limit"
				type="number"
				min={0}
				max={4000}
				bind:value={timeLimit}
			/>
			ms
		</div>
		<div>
			<label for="memory-limit">Memory limit:</label>
			<input
				id="memory-limit"
				type="number"
				min={0}
				max={4096}
				bind:value={memoryLimit}
			/>
			MB
		</div>
		<div>
			<label>Test cases:</label>
			{#each testCases as { id, input, output } (id)}
				<div class="test-case">
					<label for="input-{id}">Input: </label><br />
					<textarea id="input-{id}" bind:value={input} /><br />
					<label for="output-{id}">Correct output:</label><br />
					<textarea id="output-{id}" bind:value={output} />
					<button on:click={removeTestCase(id)}>Remove</button>
				</div>
			{/each}
			<button on:click={addTestCase}>Add</button>
		</div>
		<div>
			<label for="description">Problem description (html):</label>
			<br />
			<textarea id="description" bind:value={description} />
			<br />
			<button on:click={updateSaneDescription}>
				Update description preview
			</button>
			{#if saneDescription}
				<article>
					{@html saneDescription}
				</article>
			{/if}
		</div>
		<div>
			<button on:click={submit}>Create problem</button>
		</div>
	</main>
</div>
