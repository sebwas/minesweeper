import React from 'react'
import { faBomb, faFlag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { GameStatus, useGameState } from '../GameProvider'

import styles from './GameGrid.module.css'

export default function Field({x, y, ...delegated}: {x: number, y: number}) {
	const { handleGridClick, cover, flag, mine, status, mineCount } = useGameState()

	function handleClick(e: React.MouseEvent, isContextMenu = false, preventNormalClick = false) {
		e.preventDefault()
		e.stopPropagation()

		if (status !== GameStatus.running && status !== GameStatus.idle) {
			return
		}

		if (e.button === 2) {
			isContextMenu = true
		}

		if (preventNormalClick) {
			return
		}

		handleGridClick({x, y}, isContextMenu, true)
	}

	if (status === GameStatus.lose && (mine[y][x] || flag[y][x])) {
		const mineClass = mine[y][x] ? styles.mined : styles.unmined
		const flagClass = flag[y][x] ? styles.flagged : styles.unflagged

		return (
			<button className={`${styles.field} ${mineClass} ${flagClass}`}>
				<FontAwesomeIcon icon={flag[y][x] ? faFlag : faBomb} />
			</button>
		)
	}

	if (flag[y][x]) {
		return (
			<button
				className={`${styles.field} ${styles.flag}`}
				onClick={e => handleClick(e, false, true)}
				onContextMenu={e => handleClick(e, true)}
			>
				<FontAwesomeIcon icon={faFlag} />
			</button>
		)
	}

	if (!cover[y][x]) {
		return (
			<button className={`${styles.field} ${styles.uncovered} ${styles[`count-${mineCount[y][x]}`]}`}>
				{mineCount[y][x] || ''}
			</button>
		)
	}

	return (
		<button
			className={styles.field}
			{...delegated}
			onClick={e => handleClick(e, false, false)}
			onContextMenu={e => handleClick(e, true)}
		/>
	)
}
