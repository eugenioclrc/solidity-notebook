<script>

	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let line;
  export let selected = true;
  export let running = false;

  let codeArea;
  let editor;


  function run(cm) {

    let o = {
      id: line.id,
      value: cm.getValue(),
    }
    dispatch('run', o);
  }

	onMount(() => {
		editor = CodeMirror.fromTextArea(codeArea, {
			theme: "solidity",
			matchBrackets: true,
			indentUnit: 4,
			lineNumbers: false,
			tabSize: 8,
			inputStyle: "contenteditable",
			indentWithTabs: true,
			mode: "text/x-solidity",
			lineWrapping: true,
			  extraKeys: {
          'Ctrl-Enter': run,
					'Cmd-Enter': run,
				}
		});

		
	});
</script>
    <div class="cell code_cell rendered" style="margin-bottom: 20px" class:selected={selected}>
			<div class="input">
				<div class="promp_container">
					<div class="prompt input_prompt">
						<bdi>In</bdi>&nbsp;[{#if running}*{:else}{line.line ? line.line : ''}{/if}]:
					</div>
				</div>
				<div style="border: 1px solid #cfcfcf;border-radius: 2px;    background: #f7f7f7;    line-height: 1.21429em;" class="w-full">
					<textarea bind:this={codeArea}></textarea></div>
				</div>
			</div>
      <div class="relative">
        {#if typeof line.out !== 'undefined'}
          <div class="promp_container">
            <div class="prompt input_prompt" style="color: #D84315">
              <bdi>Out</bdi>&nbsp;[{line.line}]:
            </div>
            <div style="text-align: left;color: #000;line-height: 1.21429em;padding: 0.6em; box-flex: 1; flex: 1;   max-width: calc(100% - 14ex);">
              {#if line.error}
                <pre>{line.error && line.error.map(el => el.formattedMessage).join("\n") }</pre>
              {:else}
                <pre>{JSON.stringify(line.out, null, 2)}</pre>
              {/if}
            </div>
          </div>
        {/if}
			</div>
		<!-- ... -->
	
<style>
	.cell.selected:before {
    position: absolute;
    display: block;
    top: -1px;
    left: -1px;
    width: 5px;
    height: calc(100% + 2px);
    content: '';
    background: #42A5F5;

	}
	div.cell.selected {
    border-color: #ababab;
		@apply border;
	}
	div.cell {
	    width: 100%;
    padding: 5px;
    margin: 0px;
    outline: none;
    position: relative;
    overflow: visible;
		display: flex;
    flex-direction: column;
    align-items: stretch;
    border-radius: 2px;
    border-width: 1px;
    border-style: solid;
    border-color: transparent;
    width: 100%;
    padding: 5px;
    margin: 0px;
    outline: none;
    position: relative;
    overflow: visible;
}
.input {
	  page-break-inside: avoid;
    display: box;
    box-orient: horizontal;
    box-align: stretch;
    display: flex;
    flex-direction: row;
    align-items: stretch;
}

.promp_container {
	    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    text-align: right;

}
.prompt {
    min-width: 15ex;
}

.input_prompt {
    color: #303F9F;
    border-top: 1px solid transparent;
}
.prompt {
    min-width: 14ex;
    padding: 0.4em;
    @apply font-mono m-0;
    text-align: right;
    user-select: none;
    cursor: default;
}
</style>
