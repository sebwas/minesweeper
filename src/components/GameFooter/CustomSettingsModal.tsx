import React from 'react'

import Modal from '../Modal'
import { useGameState } from '../GameProvider'

import styles from './CustomSettingsModal.module.css'

export default function CustomSettingsModal({ isOpen, close }: { isOpen: boolean, close: () => void }) {
	const { difficulties, setCustomDifficulty } = useGameState()

	const [width, setWidth] = React.useState(difficulties.custom.dimensions.width)
	const [height, setHeight] = React.useState(difficulties.custom.dimensions.height)
	const [mines, setMines] = React.useState(difficulties.custom.mineCount)

	function saveSettings(e?: React.FormEvent) {
		e?.preventDefault()

		setCustomDifficulty({ width, height, mines })

		close()
	}

	return (
		<Modal
			isOpen={isOpen}
			dismiss={close}
			title="Settings"
			footer={<Footer save={saveSettings} cancel={close} />}
		>
			<form onSubmit={saveSettings}>
				<fieldset className={styles.form}>
					<label htmlFor="custom-settings-width">
						Width:
					</label>

					<input
						type="number"
						id="custom-settings-width"
						value={width}
						onChange={e => setWidth(Number(e.target.value))}
						required
						min={5}
					/>

					<label htmlFor="custom-settings-height">
						Height:
					</label>

					<input
						type="number"
						id="custom-settings-height"
						value={height}
						onChange={e => setHeight(Number(e.target.value))}
						required
						min={5}
					/>

					<label htmlFor="custom-settings-mines">
						Mines:
					</label>

					<input
						type="number"
						id="custom-settings-mines"
						value={mines}
						onChange={e => setMines(Number(e.target.value))}
						required
						min={10}
					/>
				</fieldset>
			</form>
		</Modal>
	)
}

function Footer({ save, cancel }: { save: () => void, cancel: () => void }) {
	return (
		<div className={styles.footer}>
			<span />

			<button className={styles.button} onClick={cancel}>
				Cancel
			</button>

			<button className={`${styles.button} ${styles.primary}`} onClick={save}>
				OK
			</button>
		</div>
	)
}
