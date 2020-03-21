<style>
	.status {
		padding: 10px;
		text-transform: capitalize;
		color: red;
	}

	.hl {
		background-color: #ddd;
	}

	.accepted {
		color: green;
	}

	.pending {
		color: grey;
	}

	.status > * {
		display: inline-block;
	}

	.spinning {
		animation: spin 2s ease infinite;
	}

	@keyframes spin {
		0% {
			transform: rotateZ(0);
		}
		100% {
			transform: rotateZ(360deg);
		}
	}
</style>

<script>
	export let status;
	export let hl;
</script>

<div
	class="status"
 	class:hl
	class:accepted={status === "accepted"}
	class:pending={status === "pending"}
>
	<p>{status.replace("-", " ")}</p>
	{#if status === "accepted"}
		<p style="color: green">✔️</p>
	{:else if status === "pending"}
		<p class="spinning" style="color: grey">⏳</p>
	{:else}
		<p style="color: red">❌</p>
	{/if}
</div>
