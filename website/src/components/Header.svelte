<script>
	export let segment;
</script>

<style>
	header {
		display: flex;
		justify-content: space-between;
	}

	ul {
		display: flex;
		justify-content: flex-start;
		list-style: none;
	}

	a {
		padding: 5px;
		text-decoration: none;
	}

	.account {

	}
</style>

<header>
	<nav>
		<ul>
			<li><a class:active={segment === undefined} href=".">Home</a></li>
			<li><a class:active={segment === "problems"} href="problems">Problems</a></li>
			<li><a class:active={segment === "ranklist"} href="ranklist">Ranklists</a></li>
			<li><a class:active={segment === "help"} href="help">Help</a></li>
		</ul>
	</nav>
	<section class="account">
		<p>Log in</p>
	</section>
</header>