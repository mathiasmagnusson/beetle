<style>
	.status {
		padding: 10px;
		text-transform: capitalize;
	}
	.hl {
		background-color: #ddd;
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
	import { statusToColor } from "../util.js";

	export let status;
	export let hl = false;
</script>

<div
	class="status"
	class:hl
	class:accepted={status === "accepted"}
	class:pending={status === "pending"}
	style="color: {statusToColor(status)}"
>
	<p>{status.replace("-", " ")}</p>
	{#if status === "pending"}
		<p style="color: grey" class="spinning">⏳</p>
	{:else}
		<i class="fas fa-{
			status === "accepted" ? "check" : "times"
		}"></i>
	{/if}
</div>
