export default class GameError extends Error {
	public static mineCountTooHighText = 'The number of mines is greater than the number of free fields.'

	static mineCountTooHigh() {
		return new Error(GameError.mineCountTooHighText)
	}
}
