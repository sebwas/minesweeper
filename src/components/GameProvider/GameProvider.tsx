import React, { PropsWithChildren } from 'react'

import { createEmptyGrid, createGameGrids, handleClick } from '../../lib/game'

import useDifficulties from '../../hooks/use-difficulties'
import useGameSaving from '../../hooks/use-game-saving'

import { reduceToSum } from '../../lib/arrays'
import { useFireworks } from '../Fireworks'
import { FieldIsFlaggedField, FieldIsMineField, FieldIsNotCovered } from '../../lib/errors'

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
	difficulties: ReturnType<typeof useDifficulties>[0]
	difficulty: keyof ReturnType<typeof useDifficulties>[0]
	setCustomDifficulty: ReturnType<typeof useDifficulties>[1]
	handleGridClick: (coordinates: Coordinates, isRightClick: boolean, skipValidityCheck: boolean) => void
	setDifficulty: (difficulty: keyof ReturnType<typeof useDifficulties>[0]) => void
	restart: () => void
}

const GameContext = React.createContext<ProvidedContext>(null as unknown as ProvidedContext)

/**
 * Use the game API anywhere in the application.
 */
export function useGameState() {
	return React.useContext(GameContext) as ProvidedContext
}

export default function GameProvider({ children }: PropsWithChildren) {
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

	const [difficulties, setCustomDifficulty, difficulty, setDifficulty] = useDifficulties()

	const [grids, setGrids] = React.useState(
		() => initializeEmptyGrids(difficulties[difficulty].dimensions)
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

		setGrids(initializeEmptyGrids(difficulties[difficulty].dimensions))
	}, [status, difficulty, difficulties])

	const { startFireworks } = useFireworks()

	// When the player wins, start the fireworks.
	React.useEffect(() => {
		if (status === GameStatus.win) {
			startFireworks()
		}
	}, [status, startFireworks])

	useGameSaving([grids, setGrids], [status, setStatus], [timeElapsed, setTimeElapsed])

	/**
	 * Handle a click at a given set of coordinates. If the playfield does not
	 * yet exist, create it.
	 */
	function handleGridClick(clickCoordinates: Coordinates, isRightClick = false, skipValidityCheck = false) {
		const currentGrids = status === GameStatus.running
			? grids
			: startGame(clickCoordinates)

		let newGrids = currentGrids

		try {
			newGrids = handleClick(currentGrids, clickCoordinates, isRightClick, skipValidityCheck)
		} catch (e) {
			if (e instanceof FieldIsNotCovered || e instanceof FieldIsFlaggedField) {
				// Ignore; the field will remain the same.
			}

			if (e instanceof FieldIsMineField) {
				setStatus(GameStatus.lose)
			}
		}

		setGrids(newGrids)

		if (reduceToSum(newGrids.cover.map(reduceToSum)) === difficulties[difficulty].mineCount) {
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

		const selectedDifficulty = difficulties[difficulty]

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

	let testUtils = {}

	if (import.meta.env.MODE === 'test') {
		testUtils = {
			grids,
			setGrids,
			setStatus,
		}
	}

	const exported = {
		totalMines,
		flaggedMineCount,
		timeElapsed,
		difficulties,
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
		setCustomDifficulty,

		...testUtils,
	}

	return (
		<GameContext.Provider value={exported}>
			{children}
		</GameContext.Provider>
	)
}
