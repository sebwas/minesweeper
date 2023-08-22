export default class GameError extends Error {
	public static mineCountTooHighText = 'The number of mines is greater than the number of free fields.'

	private static gameGridsAreInvalidText = (reason: string) => `The game grids are not valid: ${reason}.`

	public static gameGridsAreInvalidReasons = {
		MISSING_GRID: 'Missing grid',
		DIMENSION_MISMATCH: 'The dimensions don\'t match',
		UNEXPECTED_VALUES_MINE_GRID: 'The min grid has unexpected values',
		UNEXPECTED_VALUES_FLAG_GRID: 'The flag grid has unexpected values',
		UNEXPECTED_VALUES_MINE_COUNT_GRID: 'The mine count grid has unexpected values',
		UNEXPECTED_VALUES_COVER_GRID: 'The cover grid has unexpected values',
	}

	public static mineCountTooHigh() {
		return new GameError(GameError.mineCountTooHighText)
	}

	public static gridsAreMissing() {
		return GameError.gameGridsAreInvalid(GameError.gameGridsAreInvalidReasons.MISSING_GRID)
	}

	public static dimensionMismatch() {
		return GameError.gameGridsAreInvalid(GameError.gameGridsAreInvalidReasons.DIMENSION_MISMATCH)
	}

	public static mineGridHasUnexpectedValues() {
		return GameError.gameGridsAreInvalid(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_MINE_GRID)
	}

	public static flagGridHasUnexpectedValues() {
		return GameError.gameGridsAreInvalid(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_FLAG_GRID)
	}

	public static mineCountGridHasUnexpectedValues() {
		return GameError.gameGridsAreInvalid(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_MINE_COUNT_GRID)
	}

	public static coverGridHasUnexpectedValues() {
		return GameError.gameGridsAreInvalid(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_COVER_GRID)
	}

	private static gameGridsAreInvalid(reason: string) {
		return new GameError(GameError.gameGridsAreInvalidText(reason))
	}
}

export class FieldIsNotCovered extends GameError {}

export class FieldIsMineField extends GameError {}

export class FieldIsFlaggedField extends GameError {}
