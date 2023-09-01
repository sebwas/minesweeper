import React from 'react'
import { GameGrids, fromSaveState, toSaveState } from '../lib/game'
import { GameStatus } from '../components/GameProvider'

const SAVED_GAME = 'minesweeper-savegame'

type S<T> = [T, React.Dispatch<React.SetStateAction<T>>]

export default function useGameSaving(
	[grids, setGrids]: S<GameGrids>,
	[status, setStatus]: S<GameStatus>,
	[timeElapsed, setTimeElapsed]: S<number>
) {
	React.useEffect(() => {
		const savedData = localStorage.getItem(SAVED_GAME)?.split('.')

		if (savedData?.length) {
			try {
				const saveGame = fromSaveState(savedData.at(1) ?? '')

				if (saveGame) {
					setGrids(grids = saveGame)
					setStatus(status = GameStatus.running)
					setTimeElapsed((timeElapsed = Number(savedData.at(0) ?? '0')))
				}
			} catch {
				console.error('Could not load save state.')
			}
		}
	}, [setGrids, setStatus, setTimeElapsed])

	// Save the playfield when it changes.
	React.useEffect(() => {
		let gridsToSave: null | typeof grids = grids

		if (status !== GameStatus.running) {
			gridsToSave = null
		}

		const saveState = toSaveState(gridsToSave)

		if (saveState) {
			localStorage.setItem(SAVED_GAME, `${timeElapsed}.${saveState}`)
		} else {
			localStorage.setItem(SAVED_GAME, '')
		}
	}, [status, grids, timeElapsed])
}
