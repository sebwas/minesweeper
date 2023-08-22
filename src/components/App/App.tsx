import React from 'react'

import GameProvider from "../GameProvider"
import GameHeader from "../GameHeader"
import GameGrid from "../GameGrid"
import GameFooter from '../GameFooter'
import FireworksProvider from "../Fireworks"

import styles from './App.module.css'

function App() {
	const playfieldRef = React.useRef<HTMLDivElement>(null)

	return (
		<>
			<FireworksProvider playfieldRef={playfieldRef}>
				<GameProvider>
					<div className={styles.app} ref={playfieldRef}>
						<GameHeader />
						<GameGrid />
						<GameFooter />
					</div>
				</GameProvider>
			</FireworksProvider>

			<a
				className={styles.ribbon}
				href="https://github.com/sebwas/minesweeper"
				target="_blank"
			>
				<img
					decoding="async"
					width="149"
					height="149"
					src="https://github.blog/wp-content/uploads/2008/12/forkme_right_white_ffffff.png?resize=149%2C149"
					className="attachment-full size-full"
					alt="Fork me on GitHub"
					loading="lazy"
					data-recalc-dims="1"
				/>
			</a>
		</>
	)
}

export default App
