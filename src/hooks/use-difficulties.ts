import React from "react"

export const DIFFICULTIES: (PresetDifficulties | 'custom')[] = [
	'beginner',
	'intermediate',
	'expert',
	'custom',
]

const DEFAULT_DIFFICULTIES: Record<PresetDifficulties, GameDifficulty> = {
	beginner: {
		dimensions: { width: 9, height: 9 },
		mineCount: 10
	},

	intermediate: {
		dimensions: { width: 16, height: 16 },
		mineCount: 40
	},

	expert: {
		dimensions: { width: 30, height: 16 },
		mineCount: 99
	},
}

const CUSTOM_SAVE_KEY = 'minesweeper-custom-settings'

export default function useDifficulties() {
	const [difficulties, setDifficulties] = React.useState<Record<string, GameDifficulty>>(() => {
		const [
			width = 10,
			height = 10,
			mineCount = 20,
		] = (localStorage.getItem(CUSTOM_SAVE_KEY) ?? '10.10.20')
			.split('.')
			.map(Number)

		return {
			...DEFAULT_DIFFICULTIES,
			custom: {
				dimensions: { width, height },
				mineCount,
			}
		}
	})

	const setCustomDifficulty = React.useCallback(
		function setCustomDifficulty({ width, height, mines }: { width: number, height: number, mines: number }) {
			localStorage.setItem(CUSTOM_SAVE_KEY, `${width}.${height}.${mines}`)

			setDifficulties({
				...difficulties,
				custom: {
					dimensions: { width: Math.max(5, width), height: Math.max(5, height) },
					mineCount: Math.max(10, mines)
				}
			})
		},
		[difficulties]
	)

	return [difficulties, setCustomDifficulty] as [typeof difficulties, typeof setCustomDifficulty]
}
