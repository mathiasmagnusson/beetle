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
	p, a {
		margin-bottom: 10px;
	}
</style>

<script>
	export let status;
	export let error;

	const dev = process.env.NODE_ENV === "development";
</script>

<svelte:head>
	<title>Beetle - 🐛 - {status}</title>
</svelte:head>

<div class="wrapper">
	<main>
		<h1>{status}</h1>

		<p>{error.message}</p>

		{#if status === 401}
			<a href="/login">Log in</a>
		{/if}

		{#if dev && error.stack}
			<pre>{error.stack}</pre>
		{/if}
	</main>
</div>
