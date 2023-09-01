import React from 'react'

import { useGameState } from '../GameProvider'
import Field from './Field'
import InnerScrollShadow from '../InnerScrollShadow'
import { getGridDimensions } from '../../lib/game'

import styles from './GameGrid.module.css'

export default function GameGrid() {
	const { cover } = useGameState()
	const { width, height } = getGridDimensions(cover)

	const grid = React.useRef<HTMLDivElement>(null)

	return (
		<InnerScrollShadow
			element={grid}
			className={styles['grid-outer']}
			margin={10}
		>
			<div
				ref={grid}
				className={styles.grid}
				style={{
					// @ts-expect-error TS doesn't recognize that I am setting a CSS variable here.
					'--row-count': height,
					'--column-count': width
				}}
			>
				{
					cover.map((_, y) =>
						cover[y].map(
							(_, x) => <Field x={x} y={y} key={`field-${x}:${y}`} />
						)
					)
				}
			</div>
		</InnerScrollShadow>
	)
}
