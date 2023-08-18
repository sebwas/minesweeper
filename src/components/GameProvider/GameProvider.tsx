import React, { PropsWithChildren } from 'react'

import { createEmptyGrid, createGameGrids, handleClick } from '../../lib/game'

import { DIFFICULTIES } from '../../lib/settings'
import { reduceToSum } from '../../lib/arrays'
import { useFireworks } from '../Fireworks'

export enum GameStatus { idle, running, lose, win }

type ProvidedContext = {
	totalMines: number
	flaggedMineCount: number
	timeElapsed: number
	mine: MineGrid<0 | 1>
	cover: MineGrid<0 | 1>
	flag: MineGrid<0 | 1>
	mineCount: MineGrid<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>
	status: GameStatus
	difficulty: keyof typeof DIFFICULTIES
	handleGridClick: (coordinates: Coordinates, isRightClick: boolean) => void
	setDifficulty: (difficulty: keyof typeof DIFFICULTIES) => void
	restart: () => void
}

const GameContext = React.createContext<ProvidedContext>(null as unknown as ProvidedContext)

/**
 * Use the game API anywhere in the application.
 */
export function useGameState() {
	return React.useContext(GameContext) as ProvidedContext
}

// The local storage key to save and retrieve the difficulty the player set.
const SAVED_DIFFICULTY_STORAGE_KEY = 'minesweeper-difficulty'

export default function GameProvider(
	{
		children,
		playfieldRef
	}: PropsWithChildren<{ playfieldRef: React.RefObject<HTMLDivElement> }>
) {
	/**
	 * Initialize and return an empty set of grids that can be used to render
	 * the playfield while the game is idle.
	 *
	 * @param dimensions
	 */
	function initializeEmptyGrids(dimensions: GridDimensions) {
		return {
			mine: createEmptyGrid<0 | 1>(dimensions),
			cover: createEmptyGrid<0 | 1>(dimensions, 1),
			flag: createEmptyGrid<0 | 1>(dimensions),
			mineCount: createEmptyGrid<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(dimensions),
		}
	}

	const [difficulty, setDifficulty] = React.useState<keyof typeof DIFFICULTIES>(
		() => {
			const savedDifficulty = localStorage.getItem(SAVED_DIFFICULTY_STORAGE_KEY)

			if (!savedDifficulty || !Object.keys(DIFFICULTIES).includes(savedDifficulty)) {
				return Object.keys(DIFFICULTIES)[0] as PresetDifficulties
			}

			return savedDifficulty as PresetDifficulties
		}
	)

	// Save the difficulty in local storage.
	React.useEffect(() => {
		localStorage.setItem(SAVED_DIFFICULTY_STORAGE_KEY, difficulty)
	}, [difficulty])

	const [grids, setGrids] = React.useState(
		() => initializeEmptyGrids(DIFFICULTIES[difficulty].dimensions)
	)

	const [status, setStatus] = React.useState(GameStatus.idle)
	const [timeElapsed, setTimeElapsed] = React.useState(0)

	// When the player starts playing, start the clock.
	React.useEffect(() => {
		if (status !== GameStatus.running) {
			return
		}

		const timeElapsedUpdaterInterval = window.setInterval(
			() => setTimeElapsed(timeElapsed + 1),
			1000
		)

		return () => window.clearInterval(timeElapsedUpdaterInterval)
	}, [status, timeElapsed])

	// When idle, resize the playing field immediately.
	React.useEffect(() => {
		if (status !== GameStatus.idle) {
			return
		}

		setGrids(initializeEmptyGrids(DIFFICULTIES[difficulty].dimensions))
	}, [status, difficulty])

	const { startFireworks } = useFireworks()

	// When the player wins, start the fireworks.
	React.useEffect(() => {
		if (status === GameStatus.win) {
			startFireworks({
				playfield: playfieldRef.current as HTMLDivElement
			})
		}
	}, [status, playfieldRef, startFireworks])

	/**
	 * Handle a click at a given set of coordinates. If the playfield does not
	 * yet exist, create it.
	 *
	 * @param clickCoordinates
	 * @param isRightClick
	 */
	function handleGridClick(clickCoordinates: Coordinates, isRightClick = false) {
		const { x, y } = clickCoordinates

		const currentGrids = status === GameStatus.running
			? grids
			: startGame(clickCoordinates)

		if (currentGrids.mine[y][x] && !isRightClick) {
			setStatus(GameStatus.lose)
		}

		const newGrids = handleClick(currentGrids, clickCoordinates, isRightClick)

		setGrids(newGrids)

		if (reduceToSum(newGrids.cover.map(reduceToSum)) === DIFFICULTIES[difficulty].mineCount) {
			setStatus(GameStatus.win)
		}
	}

	function resetGame() {
		setTimeElapsed(0)
		setStatus(GameStatus.idle)
	}

	/**
	 * Start the game by creating the playing field.
	 */
	function startGame(firstClickCoordinates: Coordinates) {
		resetGame()
		setStatus(GameStatus.running)

		const selectedDifficulty = DIFFICULTIES[difficulty]

		const grid = createGameGrids(
			selectedDifficulty.dimensions,
			selectedDifficulty.mineCount,
			firstClickCoordinates
		)

		return grid
	}

	// Two globally provided helper variables regarding the number of mines and
	// the number of flags.
	const totalMines = reduceToSum(grids.mine.map(reduceToSum))
	const flaggedMineCount = reduceToSum(grids.flag.map(reduceToSum))

	// Destructure the grids to have more finegrained control.
	const { mine, mineCount, flag, cover } = grids

	const exported = {
		totalMines,
		flaggedMineCount,
		timeElapsed,
		difficulty,
		status,

		// Grids
		mine,
		mineCount,
		flag,
		cover,

		// Methods
		handleGridClick,
		setDifficulty,
		restart: resetGame,
	}

	return (
		<GameContext.Provider value={exported}>
			{children}
		</GameContext.Provider>
	)
}
