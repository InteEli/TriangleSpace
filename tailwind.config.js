// @ts-check <- Add this to the top of this file to enable type checking!
import { join } from 'path'; //https://github.com/skeletonlabs/skeleton/pull/1660

// 1. Import the new plugin
import { skeleton } from '@skeletonlabs/tw-plugin';

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		join(require.resolve('@skeletonlabs/skeleton'), '../**/*.{html,js,svelte,ts}')
	],
	plugins: [
		skeleton({
			themes: {
				// if we were using `theme-skeleton.css`
				preset: [ { name: "skeleton", enhancements: true }, { name: "crimson", enhancements: true }, {name: "sahara", enhancements: true}, { name: "vintage", enhancements: true }, {name: "wintry", enhancements: true}, { name: "seafoam", enhancements: true }, {name: "gold-nouveau", enhancements: true}, { name: "hamlindigo", enhancements: true }, {name: "skeleton", enhancements: true}, {name: "rocket", enhancements: true}], 
				
				
			}
		})
	]
};
