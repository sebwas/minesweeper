import { GameStatus, useGameState } from "../GameProvider"
import SevenSegmentNumberDisplay from "./SevenSegmentNumberDisplay"
import VisuallyHidden from "../VisuallyHidden"

import FaceSmile from '../../assets/icons/face-smile-duotone.svg'
import FaceTired from '../../assets/icons/face-tired-duotone.svg'
import FaceWink from '../../assets/icons/face-wink-duotone.svg'

import styles from './GameHeader.module.css'

export default function GameHeader() {
	const { timeElapsed, flaggedMineCount, totalMines, restart, status } = useGameState()

	const icon = getSmileyFace(status)

	return (
		<div className={styles.header}>
			<SevenSegmentNumberDisplay
				number={totalMines - flaggedMineCount}
				minSize={3}
				maxSize={3}
			/>

			<button
				onClick={restart}
				className={styles.button}
			>
				<img src={icon} alt={getButtonLabel(status)} />

				<VisuallyHidden>
					Restart game
				</VisuallyHidden>
			</button>

			<SevenSegmentNumberDisplay
				number={timeElapsed}
				minSize={3}
				maxSize={3}
			/>
		</div>
	)
}

function getSmileyFace(status: GameStatus) {
	switch (status) {
		case GameStatus.lose:
			return FaceTired
		case GameStatus.win:
			return FaceWink
		default:
			return FaceSmile
	}
}

function getButtonLabel(status: GameStatus) {
	switch (status) {
		case GameStatus.lose:
			return 'You lost'
		case GameStatus.win:
			return 'You won'
		default:
			return 'You are currently playing'
	}
}
