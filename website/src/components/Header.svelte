<script>
	import { crossfade } from "svelte/transition";

	export let segment;

	const [send, receive] = crossfade({});

	let routes = [
		{ href: undefined, name: "Home" },
		{ href: "problems", name: "Problems" },
		{ href: "ranklist", name: "Ranklist" },
		{ href: "submissions", name: "Submissions" },
	];
</script>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #303030;
		color: white;
		height: 60px;
		padding: 0 20px;
	}

	nav {
		font-size: 18px;
	}

	ul {
		display: flex;
		justify-content: left;
		list-style: none;
	}

	nav li {
		position: relative;
	}

	nav a {
		padding: 5px;
		text-decoration: none;
		color: white;
	}

	.active-route {
		position: absolute;
		width: 100%;
		height: 4px;
		background-color: #108010;
	}

	.account {
		display: flex;
		justify-content: flex-end;
		align-items: center;

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
