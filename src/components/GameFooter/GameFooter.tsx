import React from 'react'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSliders } from "@fortawesome/free-solid-svg-icons"

import { GameStatus, useGameState } from "../GameProvider"
import CustomSettingsModal from "./CustomSettingsModal"

import styles from './GameFooter.module.css'

export default function GameFooter() {
	const { status, difficulty, setDifficulty, difficulties } = useGameState()

	const [isOpen, setIsOpen] = React.useState(false)

	function closeSettingsModal() {
		setIsOpen(false)
	}

	function openSettingsModal() {
		setIsOpen(true)
	}

	return (
		<>
			<fieldset
				disabled={status === GameStatus.running}
				className={styles.footer}
			>
				<label htmlFor="difficulty-selector">
					Difficulty
				</label>

				<select
					onChange={e => setDifficulty(e.target.value)}
					value={difficulty}
				>
					{Object.keys(difficulties).map(difficulty => (
						<option
							key={difficulty}
							value={difficulty}
						>
							{difficulty}
						</option>
					))}
				</select>

				{
					difficulty === 'custom'
					&& <button onClick={openSettingsModal} className={styles['edit-button']}>
						<FontAwesomeIcon icon={faSliders} />
					</button>
				}
			</fieldset>

			<CustomSettingsModal isOpen={isOpen} close={closeSettingsModal} />
		</>
	)
}
