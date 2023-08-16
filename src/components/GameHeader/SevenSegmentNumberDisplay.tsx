import styles from './SevenSegmentNumberDisplay.module.css'

import '../../assets/seven-segments-font/stylesheet.css'

export default function SevenSegmentNumberDisplay(
	{ number, minSize, maxSize }: { number: number, minSize: number, maxSize: number }
) {
	const numberAsString = number.toString()
		.padStart(minSize, '0')
		.substring(0, maxSize)

	return (
		<div className={`${styles.display} font-[seven-segments]`}>
			{numberAsString.split('').map(
				(char, ix) => (<div key={ix} className={styles.char}>{char}</div>)
			)}
		</div>
	)
}