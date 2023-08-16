import { GameStatus, useGameState } from "../GameProvider"
import { DIFFICULTIES } from "../../lib/settings"

import styles from './GameFooter.module.css'

export default function GameFooter() {
	const { status, difficulty, setDifficulty } = useGameState()

	return (
		<fieldset
			disabled={status === GameStatus.running}
			className={styles.footer}
		>
			<label htmlFor="difficulty-selector">
				Difficulty
			</label>

			<select
				onChange={e => setDifficulty(e.target.value as PresetDifficulties)}
				value={difficulty}
			>
				{Object.keys(DIFFICULTIES).map((difficulty => (
					<option
						key={difficulty}
						value={difficulty}
					>
						{difficulty}
					</option>
				)))}
			</select>
		</fieldset>
	)
}
