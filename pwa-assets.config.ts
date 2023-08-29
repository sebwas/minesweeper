import { defineConfig } from '@vite-pwa/assets-generator/config'
import type { Preset } from '@vite-pwa/assets-generator/config';

const preset: Preset = {
	transparent: {
		sizes: [64, 192, 512],
		favicons: [[64, 'favicon.ico']],
	},

	maskable: {
		sizes: [512],
	},

	apple: {
		sizes: [180],
	},
}

export default defineConfig({
	preset,
	images: ['public/favicon.svg']
})
