<script>
	import Menu from "../components/Menu.svelte";
	import MessageViewer from "../components/MessageViewer.svelte";

	export let segment;
</script>

<style>
	div {
		min-height: 100vh;
	}

	@media only screen and (min-width: 601px) {
		div {
			margin-left: 5rem;
		}
	}
</style>

<Menu {segment} />

<div>
	<slot></slot>
</div>

<MessageViewer />
