import React from 'react'
import { faBomb, faFlag } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { GameStatus, useGameState } from '../GameProvider'
import VisuallyHidden from '../VisuallyHidden'

import styles from './GameGrid.module.css'

type ClickHandlerFunction = (e: React.MouseEvent, isContextMenu?: boolean, preventNormalClick?: boolean) => void

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
		return (
			<GameLostField
				icon={flag[y][x] ? faFlag : faBomb}
				isMined={Boolean(mine[y][x])}
				isFlagged={Boolean(flag[y][x])}
			/>
		)
	}

	if (flag[y][x]) {
		return <FlaggedField handleClick={handleClick} />
	}

	if (!cover[y][x]) {
		return <UncoveredField count={mineCount[y][x]} />
	}

	return <CoveredField handleClick={handleClick} {...delegated} />
}

function GameLostField(
	{
		icon,
		isMined,
		isFlagged
	}: {
		icon: typeof faFlag | typeof faBomb,
		isMined: boolean,
		isFlagged: boolean
	}
) {
	const mineClass = isMined ? styles.mined : styles.unmined
	const flagClass = isFlagged ? styles.flagged : styles.unflagged

	return (
		<button className={`${styles.field} ${mineClass} ${flagClass}`}>
			<FontAwesomeIcon icon={icon} />

			<VisuallyHidden>lost, with { isFlagged ? 'flag' : 'mine' }</VisuallyHidden>
		</button>
	)
}

function FlaggedField({ handleClick }: { handleClick: ClickHandlerFunction }) {
	return (
		<button
			className={`${styles.field} ${styles.flag}`}
			onClick={e => handleClick(e, false, true)}
			onContextMenu={e => handleClick(e, true)}
		>
			<FontAwesomeIcon icon={faFlag} />

			<VisuallyHidden>flagged</VisuallyHidden>
		</button>
	)
}

function UncoveredField({ count }: { count: number }) {
	return (
		<button className={`${styles.field} ${styles.uncovered} ${styles[`count-${count}`]}`}>
			{count || ''}
		</button>
	)
}

function CoveredField({ handleClick, ...delegated }: { handleClick: ClickHandlerFunction }) {
	return (
		<button
			className={styles.field}
			{...delegated}
			onClick={e => handleClick(e, false, false)}
			onContextMenu={e => handleClick(e, true)}
		>
			<VisuallyHidden>covered</VisuallyHidden>
		</button>
	)
}
