import React from 'react'
import { cleanup, render } from '@testing-library/react'
import { afterEach } from 'vitest'

import GameProvider, { useGameState } from '../../src/components/GameProvider'

const gameControl: { control: null | ReturnType<typeof useGameState> } = { control: null }

afterEach(() => {
	cleanup()

	gameControl.control = null
})

export function getGameControl() {
	if (!gameControl.control) {
		customRender(<></>)
	}

	return gameControl as { control: ReturnType<typeof useGameState> }
}

function customRender(ui: React.ReactElement, options = {}) {
	function ControlWrapper({ children }: React.PropsWithChildren) {
		gameControl.control = useGameState()

		return <>{children}</>
	}

	return render(ui, {
		// wrap provider(s) here if needed
		wrapper: ({ children }) => (
			<GameProvider>
				<ControlWrapper>
					{children}
				</ControlWrapper>
			</GameProvider>
		),
		...options,
	})
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'

// override render export
export { customRender as render }
