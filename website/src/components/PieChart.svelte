<style>
	div {
		overflow: hidden;
	}
</style>

<script>
	import { onMount, tick } from "svelte";

	export let data;

	let total = data.reduce((total, d) => total + d.value, 0);

	let slices = [];

	$: {
		slices = [];
		for (let i in data) {
			slices.push({
				angle: data[i].value * Math.PI * 2/ total,
				...data[i],
			});
		}
	}

	let canvas;
	let clientWidth;
	let clientHeight;
	let width;
	let height;

	$: {
		width = clientWidth;
		height = clientHeight - 5;

		if (canvas) {
			canvas.width = width;
			canvas.height = height;
		}
	}

	onMount(async () => {
		await tick();

		let ctx = canvas.getContext("2d");

		let r = Math.min(width, height) * 3/8;
		ctx.translate(width / 2, height / 2);
		ctx.rotate(-Math.PI / 2);

		for (const slice of slices) {
			let ax = r * Math.cos(slice.angle);
			let ay = r * Math.sin(slice.angle);

			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(r, 0);
			ctx.arc(0, 0, r, 0, slice.angle);
			ctx.lineTo(0, 0);
			ctx.fillStyle = slice.color;
			ctx.fill();

			ctx.rotate(slice.angle);

		}

		let startAngle = -Math.PI/2;
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillStyle = "black";
		ctx.font = "14px Open Sans";
		ctx.rotate(Math.PI / 2);

		for (const slice of slices) {
			let endAngle = startAngle + slice.angle;
			let midAngle = (endAngle + startAngle) / 2;

			let cx = r / 2 * Math.cos(midAngle);
			let cy = r / 2 * Math.sin(midAngle);
			ctx.fillText(slice.value, cx, cy);

			startAngle = endAngle;
		}
	});
</script>

<div bind:clientWidth bind:clientHeight>
	<canvas bind:this={canvas}></canvas>
</div>
