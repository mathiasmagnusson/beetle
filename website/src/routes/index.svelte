<style>
	.wrapper {
		min-height: 100vh;
		padding: 100px 0;
		display: flex;
		justify-content: center;
	}
	main {
		width: 80%;
		padding: 20px;
		max-width: 1300px;
		background-color: white;
		border-radius: 5px;
		box-shadow: 0 0 10px -6px #0008;
		display: flex;
		flex-direction: column;
	}
	header {
		border-bottom: 1px solid #ccc;
		margin-bottom: 20px;
		display: flex;
		align-items: center;
	}
	header span {
		margin-left: auto;
		margin-right: 10px;
	}
	header button {
		background: none;
		border: none;
		font-size: 32px;
	}
	header button:hover {
		animation: wiggle 0.3s infinite;
	}
	@keyframes wiggle {
		0%   { transform: rotateZ( 0deg); }
		25%  { transform: rotateZ( 5deg); }
		50%  { transform: rotateZ( 0deg); }
		75%  { transform: rotateZ(-5deg); }
		100% { transform: rotateZ( 0deg); }
	}
	p {
		margin-left: auto;
		margin-right: auto;
		max-width: 800px;
		font-size: 19px;
	}
	p:not(:last-child) {
		margin-bottom: 10px;
	}
</style>

<script context="module">
	export async function preload(_page, session) {
		const { lang } = session;

		return { se: /sv/i.test(lang.split(",")[0] || "") };
	}
</script>

<script>
	const seFlag = String.fromCodePoint(0x1f1f8)
		+ String.fromCodePoint(0x1f1ea);

	const usFlag = String.fromCodePoint(0x1f1fa)
		+ String.fromCodePoint(0x1f1f8);

	export let se;

	function switchLang() {
		se = !se;
	}
</script>

<div class="wrapper">
<main>
	<header>
		<h1>Beetle</h1>
		<span>{se ? "Switch to english" : "Byt till svenska"}:</span>
		<button on:click={switchLang}>{se ? usFlag : seFlag}</button>
	</header>
	<article>
		{#if se}
			<p>
				Välkommen till <i>Beetle!</i>
			</p>
			<p>
				Detta är mitt (Mathias Magnussons) gymnasieprojekt som jag gjorde
				under vårterminen år 2020. I skrivande stund har jag inte arbetat
				mycket på projektet i efterhand, men förhoppningsvis får lust
				att lägga till fler funktioner, fina till webbsidan och lägga
				till fler problem att lösa någon gång.
			</p>
			<p>
				Kort sagt är projektet en webbsida för övning på
				programmeringsproblemlösning, vilket jag valde p.g.a. mitt
				intresse för just programmeringsproblemlösning samt viljan att
				testa att skapa en lite större webbsida + server med funktioner
				som inloggning osv.
			</p>
			<p>
				Som du säkerligen ser så körs projektet på denna domän
				(<a href="https://beetle.magnusson.space/">
					beetle.magnusson.space</a>). Hela projektets källkod finns
				tillgänglig på
				<a href="https://github.com/mathiasmagnusson/beetle">github</a>,
				dessutom finns rapporten om detta projekt här:
				<a href="/beetle.pdf">beetle.pdf</a>.
			</p>
			<p>
				För att navigera runt sidan, använd menyn till vänster (eller
				nedan för små skärmar/fönster). I skrivande stund är det väldigt
				fattigt med problem att lösa och konton på ranklistan, och det
				kommer troligen inte ändras speciellt mycket. Notera dock att om
				du är inloggad kan du gå in på ditt konto (sista knappen i
				menyn) och trycka på <i>Create a problem</i> för att skapa ett
				eget problem.
			</p>
			<p>
				För tillfället är det endast möjligt att lämna in lösningar
				skriva i C eller C++. Förhoppningsvis kommer även detta
				förbättras en vacker dag.
			</p>
		{:else}
			<p>
				Welcome to <i>Beetle!</i>
			</p>
			<p>
				This is a project I (Mathias Magnusson) made during my last term
				during high school, spring 2020. As of when I'm writing this, I
				have not worked much on the project since after graduating.
				Hopefully, however, I will at some point add more functions,
				improve the interface, and add more problems to solve.
			</p>
			<p>
				In short, the project in a website made for users to practice
				their skills in programming problem solving. I chose this due to
				my interest in programming problem solving and since I wanted to
				try creating a bigger website + server with functionality like
				log in etc.
			</p>
			<p>
				As you can see, the project is being run at this domain
				(<a href="https://beetle.magnusson.space/">
					beetle.magnusson.space</a>). The complete source code of the
				project is available at
				<a href="https://github.com/mathiasmagnusson/beetle">github</a>,
				and the report written about the project can be read here:
				<a href="/beetle.pdf">beetle.pdf</a>.
			</p>
			<p>
				To navigate the page, use the menu to the left (or at the bottom
				on smaller screens/widows). When I'm writing this, there are not
				many problems available to solve and there are very few accounts
				on the ranking list. Unfortunately, I do not think this will
				change very much. Note, however, that if you're logged in, you
				can go to your account (using the last button in the menu) and
				click <i>Create a problem</i> to create an own problem.
			</p>
			<p>
				At the moment it's only possible to submit solutions written in
				C or C++. Hopefully this will also be improved some time.
			</p>
		{/if}
	</article>
</main>
</div>
