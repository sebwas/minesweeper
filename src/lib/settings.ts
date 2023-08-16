export const DIFFICULTIES: Record<PresetDifficulties, GameDifficulty> = {
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
} as const
