import GameProvider from "../GameProvider"
import GameHeader from "../GameHeader"
import GameGrid from "../GameGrid"
import GameFooter from '../GameFooter'

import styles from './App.module.css'

function App() {
	return (
		<GameProvider>
			<div className={styles.app}>
				<GameHeader />
				<GameGrid />
				<GameFooter />
			</div>
		</GameProvider>
	)
}

export default App
