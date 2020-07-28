<script>
	import Menu from "../components/Menu.svelte";
	import MessageViewer from "../components/MessageViewer.svelte";

	export let segment;
</script>

<style>
	div {
		min-height: 100vh;
	}

	@media only screen and (max-width: 600px) {
		div {
			margin-bottom: 80px;
		}
	}
	@media only screen and (min-width: 601px) {
		div {
			margin-left: 80px;
		}
	}
</style>

<Menu {segment} />

<div>
	<slot></slot>
</div>

<MessageViewer />
