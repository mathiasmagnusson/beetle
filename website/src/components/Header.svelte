<script>
	import { crossfade } from "svelte/transition";

	export let segment;

	const [send, receive] = crossfade({});

	let routes = [
		{ href: undefined, name: "Home" },
		{ href: "problems", name: "Problems" },
		{ href: "ranklists", name: "Ranklists" },
		{ href: "help", name: "Help" },
	];
</script>

<style>
	header {
		display: flex;
		justify-content: space-between;
		background-color: #303030;
		color: white;
	}

	ul {
		display: flex;
		justify-content: flex-start;
		list-style: none;
	}

	a {
		padding: 5px;
		text-decoration: none;
		font-size: 18px;
	}

	.active-route {
		width: 100%;
		height: 3px;
		background-color: #108010;
	}

	.account {

	}
</style>

<header>
	<nav>
		<ul>
			{#each routes as route}
				<li>
					<a class:active={segment === route.href} href={route.href || "/"}>{route.name}</a>
					{#if segment === route.href}
						<div in:receive out:send class="active-route"></div>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>
	<section class="account">
		<p>Log in</p>
	</section>
</header>
