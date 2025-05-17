<script>
	import '../app.postcss';
	import { browser } from "$app/environment";
	// Highlight JS
	import hljs from 'highlight.js/lib/core';
	import 'highlight.js/styles/github-dark.css';
	import { storeHighlightJs } from '@skeletonlabs/skeleton';
	import xml from 'highlight.js/lib/languages/xml'; // for HTML
	import css from 'highlight.js/lib/languages/css';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import { base } from '$app/paths';
	import { computePosition, autoUpdate, flip, shift, offset, arrow } from '@floating-ui/dom';
	import { storePopup } from '@skeletonlabs/skeleton';
	import { currentTheme } from '$lib/theme-storage'; $: {if (browser) {document.body.setAttribute('data-theme', $currentTheme);}} //https://www.reddit.com/r/sveltejs/comments/15p6t4w/how_do_i_use_different_themes_with_skeleton_ui/

	hljs.registerLanguage('xml', xml); // for HTML
	hljs.registerLanguage('css', css);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	storeHighlightJs.set(hljs);
	storePopup.set({ computePosition, autoUpdate, flip, shift, offset, arrow });
</script>
<nav>
<a href="{base}/">Home</a>
<a href="{base}/current-project">Current Project</a>
</nav>

<style>
	nav {
		display: grid;
		grid-template-columns: 50px 120px 120px 10fr;
		grid-template-rows: 1fr;
		gap: 0.2rem;
		flex-direction: row;
		justify-content: center;
		width: 100%;
		height: 2rem;
		padding: 0.2rem;
		background-color: rgb(255, 255, 255);
		color: black;
	}
	a {
		width: 100%;
		height: 100%;
		color: black;
		text-align: center;
		padding: 1px;
		
	}
	:global(body){
		margin: 0;
		padding: 0;
		height: 100%;
		width: 100%;
		overflow-x: hidden;
		overflow-y:visible;
	}

</style>
<slot />