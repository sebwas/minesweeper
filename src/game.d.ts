declare type MineGrid<T extends number = number> = T[][]

declare type GridDimensions = {
	width: number
	height: number
}

declare type Coordinates = {
	x: number
	y: number
}

declare type GameDifficulty = {
	dimensions: GridDimensions
	mineCount: number
}

declare type PresetDifficulties = 'beginner' | 'intermediate' | 'expert'
