<script context="module">
	export const prerender = true;
</script>
<script>
	import { io } from "socket.io-client";

	import LineCode from "$lib/LineCode.svelte";

	import { onMount } from 'svelte';
	let line = 1;
	let socket;
	let id = 0;
	let lines = [{
		id,
		line: null,
		value: '',
		running: false,
	}];
	
	function add() {
		id++;
		lines = [...lines, {id, line:null, value: '',running: false}];
	}

	function run(event) {
		const l = lines.find(l => l.id === id);
		l.running = true;
		lines = [...lines];
		socket.emit('exec', event.detail);
	}

	onMount(() => {
		socket = io("http://127.0.0.1:3005");
		
		socket.on('error', ({ error, id, line }) => {
			const l = lines.find(l => l.id === id);
			l.running = false;
			l.line = line;
			l.error = error;
			l.out = null;
			lines = [...lines];
		});

		socket.on('response', ({ response, line, id }) => {
			const l = lines.find(l => l.id === id);
			l.running = false;
			l.error = null;
			l.line = line;
			l.out = response;
			lines = [...lines];
			/*

			.value = response;
			console.log(line, response);
			out = response;
			*/
		});		
	});
</script>

<svelte:head>
	<title>Home</title>
</svelte:head>

<div class="w-full bg-gray-200 min-h-max py-5" style="min-height: 95vh;">
	<div class="container mx-auto bg-white shadow-lg flex flex-col p-4">
		{#each lines as l}
			<LineCode line={l} running={l.running} on:run={run} />
		{/each}
		<button class="block texy-lg p-4 m-3 bg-blue-200" on:click={add}>Add</button>
			<!--
		<div class="cell code_cell rendered selected">
			<div class="input">
				<div class="promp_container">
					<div class="prompt input_prompt">
						<bdi>In</bdi>&nbsp;[12]:
					</div>
				</div>
				<div style="border: 1px solid #cfcfcf;border-radius: 2px;    background: #f7f7f7;    line-height: 1.21429em;" class="w-full">
					<textarea id="code"></textarea></div>
				</div>
			</div>
			<div class="relative">
				<div class="promp_container">
					<div class="prompt input_prompt" style="color: #D84315">
						<bdi>Out</bdi>&nbsp;[12]:
					</div>
					<div style="text-align: left;color: #000;line-height: 1.21429em;padding: 0.6em; box-flex: 1; flex: 1;   max-width: calc(100% - 14ex);"><pre>d{out}</pre></div>
				</div>
			</div>
			<div class="cell code_cell rendered unselected">
				<div class="input">
					<div class="promp_container">
						<div class="prompt input_prompt">
							<bdi>In</bdi>&nbsp;[12]:
						</div>
					</div>
				</div>
			</div>
		... -->
	</div>
</div>

