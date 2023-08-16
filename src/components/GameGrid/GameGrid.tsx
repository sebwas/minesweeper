import { useGameState } from "../GameProvider"
import Field from './Field'

import styles from './GameGrid.module.css'

export default function GameGrid() {
	const { cover } = useGameState()
	const [width, height] = [cover[0].length, cover.length]

	return (
		<div
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
	)
}
