<style>
	aside {
		position: fixed;
		background-color: #202020;
		left: 0;
		transition: width 0.2s ease-in-out;
	}
	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100%;
	}
	.logo {
		width: 100%;
		font-weight: bold;
		margin-bottom: 1rem;
		letter-spacing: 0.1ch;
		background-color: #101010;
	}
	.logo-mobile {
		background-color: #181818;
	}
	.logo span {
		font-size: 1.5rem;
	}
	.item, .logo-mobile {
		width: 100%;
	}
	.item:last-child {
		margin-top: auto;
	}
	a {
		display: flex;
		align-items: center;
		height: 5rem;
		color: #d0d0d0;
		text-decoration: none;
		filter: grayscale(100%) opacity(0.7);
		transition: 0.3s ease-in-out;
	}
	a:hover, a.active {
		color: #ffffff;
		filter: grayscale(0%) opacity(1);
		background-color: #000000;
	}
	span {
		font-size: 1em;
	}
	i {
		font-size: 2em;
		margin: 0 1.5rem;
	}

	@media only screen and (max-width: 600px) {
		aside {
			bottom: 0;
			width: 100vw;
			height: 5rem;
		}
		ul {
			flex-direction: row;
			justify-content: stretch;
		}
		span {
			display: none;
		}
		.logo {
			display: none;
		}
		a {
			justify-content: center;
		}
		i {
			text-align: center;
		}
	}

	@media only screen and (min-width: 601px) {
		aside {
			overflow-x: hidden;
			width: 5rem;
			height: 100vh;
			top: 0;
		}
		aside:hover {
			width: 16rem;
		}
		i {
			min-width: 2em;
		}
		.logo-mobile {
			display: none;
		}
	}

</style>

<script>
	/* import { crossfade } from "svelte/transition"; */

	export let segment;

	/* const [send, receive] = crossfade({}); */
</script>

<aside>
	<ul>
		<li class="logo">
			<a href="/" class:active={segment === undefined}>
				<i style="color: #50b050" class="fas fa-otter"></i>
				<span>beetle</span>
			</a>
		</li>
		<li class="item">
			<a href="/problems" class:active={segment === "problems"}>
				<i style="color: #b05050" class="fas fa-brain"></i>
				<span>Problems</span>
			</a>
		</li>
		<li class="item">
			<a href="/ranklist" class:active={segment === "ranklist"}>
				<i style="color: #5050b0" class="fas fa-sort-amount-up"></i>
				<span>Ranklist</span>
			</a>
		</li>
		<li class="logo-mobile">
			<a href="/" class:active={segment === undefined}>
				<i style="color: #000000" class="fas fa-otter"></i>
			</a>
		</li>
		<li class="item">
			<a href="/submissions" class:active={segment === "submissions"}>
				<i style="color: #b0b050" class="far fa-check-square"></i>
				<span>Submissions</span>
			</a>
		</li>
		<li class="item">
			<a href="/settings" class:active={segment === "settings"}>
				<i style="color: #b050b0" class="fas fa-cogs"></i>
				<span>Settings</span>
			</a>
		</li>
	</ul>
</aside>
