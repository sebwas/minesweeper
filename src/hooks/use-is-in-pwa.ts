import React from 'react'

const mediaMatcher = window.matchMedia('(display-mode: standalone) or (display-mode: fullscreen)')

export default function useIsInPwa() {
	const [isInPwa, setIsInPwa] = React.useState(mediaMatcher.matches)

	React.useEffect(() => {
		function update() {
			setIsInPwa(mediaMatcher.matches)
		}

		mediaMatcher.addEventListener('change', update)

		return () => mediaMatcher.removeEventListener('change', update)
	}, [])

	return isInPwa
}
