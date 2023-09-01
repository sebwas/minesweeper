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

const CUSTOM_SETTINGS_STORAGE_KEY = 'minesweeper-custom-settings'
const SAVED_DIFFICULTY_STORAGE_KEY = 'minesweeper-difficulty'

export default function useDifficulties() {
	const [difficulties, setDifficulties] = React.useState<Record<string, GameDifficulty>>(() => {
		const [
			width = 10,
			height = 10,
			mineCount = 20,
		] = (localStorage.getItem(CUSTOM_SETTINGS_STORAGE_KEY) ?? '10.10.20')
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
			localStorage.setItem(CUSTOM_SETTINGS_STORAGE_KEY, `${width}.${height}.${mines}`)

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

	const [difficulty, setDifficulty] = React.useState<keyof typeof difficulties>(
		() => {
			const savedDifficulty = localStorage.getItem(SAVED_DIFFICULTY_STORAGE_KEY)

			if (!savedDifficulty || !Object.keys(difficulties).includes(savedDifficulty)) {
				return Object.keys(difficulties)[0] as keyof typeof difficulties
			}

			return savedDifficulty as keyof typeof difficulties
		}
	)

	// Save the difficulty in local storage.
	React.useEffect(() => {
		localStorage.setItem(SAVED_DIFFICULTY_STORAGE_KEY, difficulty)
	}, [difficulty])

	return [difficulties, setCustomDifficulty, difficulty, setDifficulty] as [
		typeof difficulties,
		typeof setCustomDifficulty,
		typeof difficulty,
		typeof setDifficulty
	]
}
