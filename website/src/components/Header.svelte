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
		align-items: center;
		background-color: #303030;
		color: white;
		height: 64px;
	}

	ul {
		display: flex;
		justify-content: left;
		list-style: none;
	}

	nav a {
		padding: 5px;
		text-decoration: none;
		font-size: 18px;
		color: white;
	}

	.active-route {
		width: 100%;
		height: 3px;
		background-color: #108010;
	}

	.account {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		margin-right: 20px;

		padding: 10px;
		background-color: #fff2;
		border-radius: 6px;
	}

	.account a {
		color: white;
		text-decoration: none;
	}
</style>

<header>
	<nav>
		<ul>
			{#each routes as route}
				<li>
					<a href={route.href || "/"}>{route.name}</a>
					{#if segment === route.href}
						<div in:receive out:send class="active-route"></div>
					{/if}
				</li>
			{/each}
		</ul>
	</nav>
	<section class="account">
		<a href="/login">Log in</a>
	</section>
</header>
