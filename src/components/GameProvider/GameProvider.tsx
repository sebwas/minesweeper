import React, { PropsWithChildren } from 'react'

import { createEmptyGrid, createGameGrids, handleClick } from '../../lib/game'

import { DIFFICULTIES } from '../../lib/settings'
import { reduceToSum } from '../../lib/arrays'
import { useFireworks } from '../Fireworks'

export enum GameStatus { idle, running, lose, win }

export type GameProvider = {
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

const GameContext = React.createContext<GameProvider>(null as unknown as GameProvider)

export default function GameProvider({ children, playfieldRef }: PropsWithChildren<{ playfieldRef: React.RefObject<HTMLDivElement> }>) {
	function initializeEmptyGrids(dimensions: GridDimensions) {
		return {
			mine: createEmptyGrid<0 | 1>(dimensions),
			cover: createEmptyGrid<0 | 1>(dimensions, 1),
			flag: createEmptyGrid<0 | 1>(dimensions),
			mineCount: createEmptyGrid<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(dimensions),
		}
	}

	const [difficulty, setDifficulty] = React.useState<keyof typeof DIFFICULTIES>('beginner')

	const [grids, setGrids] = React.useState(
		() => initializeEmptyGrids(DIFFICULTIES[difficulty].dimensions)
	)

	const totalMines = reduceToSum(grids.mine.map(reduceToSum))
	const flaggedMineCount = reduceToSum(grids.flag.map(reduceToSum))

	const [timeElapsed, setTimeElapsed] = React.useState(0)
	const [status, setStatus] = React.useState(GameStatus.idle)

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

	React.useEffect(() => {
		if (status !== GameStatus.idle) {
			return
		}

		setGrids(initializeEmptyGrids(DIFFICULTIES[difficulty].dimensions))
	}, [status, difficulty])

	const { startFireworks } = useFireworks()

	React.useEffect(() => {
		if (status === GameStatus.win) {
			startFireworks({
				playfield: playfieldRef.current as HTMLDivElement
			})
		}
	}, [status, playfieldRef, startFireworks])

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

export function useGameState() {
	return React.useContext(GameContext)
}
