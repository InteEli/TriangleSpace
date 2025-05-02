import { writable } from 'svelte/store';

// Create a writable store for the current theme
export const currentTheme = writable('crimson'); // Default theme