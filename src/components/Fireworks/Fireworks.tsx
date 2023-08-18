import React, { PropsWithChildren } from 'react'

import FireworkParticleSystem from './FireworkParticleSystem'
import { ParticleSystem, Vector } from '../../lib/ParticleSystem'
import { hslToRgb } from '../../lib/colors'

import styles from './Fireworks.module.css'

type FireworksContextApi = {
	startFireworks: ({ playfield, fireworkCount}: { playfield: HTMLDivElement, fireworkCount?: number }) => void
}

const FireworksContext = React.createContext<FireworksContextApi>({} as FireworksContextApi)

export function useFireworks() {
	return React.useContext(FireworksContext)
}

export default function FireworksProvider({ children }: PropsWithChildren) {
	const canvas = React.useRef<HTMLCanvasElement>(null)

	const startFireworks = React.useCallback(
		function startFireworks(
			{
				playfield,
				fireworkCount = 8,
				additionalRounds = 2
			}: {
				playfield: HTMLDivElement,
				fireworkCount?: number,
				additionalRounds?: number
			}
		) {
			const playfieldRect = playfield.getBoundingClientRect()

			const initialLocations = [
				{
					startLocation: new Vector(playfieldRect.x, playfieldRect.y),
					startLocationRandomizer: (v: Vector) => v.add(new Vector(-10 * Math.random(), -10 * Math.random())),
					angle: () => Math.random() * 90 + 135
				},

				{
					startLocation: new Vector(playfieldRect.x + playfieldRect.width, playfieldRect.y),
					startLocationRandomizer: (v: Vector) => v.add(new Vector(10 * Math.random(), -10 * Math.random())),
					angle: () => Math.random() * 90 - 45
				},
			]

			const ctx = canvas?.current?.getContext('2d') as CanvasRenderingContext2D

			const ps = new ParticleSystem()

			ps.setIsRootPs()

			for (let i = 0; i < fireworkCount; i++) {
				// Decide whether to take the top left or top right corner as
				// starting point.
				const initial = Number(Math.random() >= 0.5)

				ps.addParticle(
					addFireworks(
						initialLocations[initial].startLocationRandomizer(
							initialLocations[initial].startLocation
						),
						initialLocations[initial].angle()
					)
				)
			}

			if (additionalRounds) {
				ps.addEndOfLifeHandler(
					() => startFireworks({ playfield, fireworkCount, additionalRounds: additionalRounds - 1 })
				)
			}

			function run() {
				ps.run(ctx)

				if (!ps.isEndOfLife()) {
					requestAnimationFrame(run)
				}
			}

			run()
		},
		[canvas]
	)

	function addFireworks({x, y}: {x: number, y: number}, angle: number, fireworkParticleCount = 5 + 5 * Math.random()) {
		const ps = new FireworkParticleSystem(
			new Vector(x, y),
			angle,
			hslToRgb(Math.round(Math.random() * 255), 100, 50),
			90 + Math.random() * 60,
			1 + Math.random()
		)

		for (let i = 0; i <= fireworkParticleCount; i++) {
			ps.addParticle()
		}

		return ps
	}

	return (
		<FireworksContext.Provider value={{ startFireworks }}>
			<Fireworks ref={canvas} />

			{children}
		</FireworksContext.Provider>
	)
}

const Fireworks = React.forwardRef<HTMLCanvasElement>((_, canvas) => {
	const [screenDimensions, setScreenDimensions] = React.useState([window.innerWidth, window.innerHeight])

	React.useEffect(() => {
		function updateDimensions() {
			setScreenDimensions([window.innerWidth, window.innerHeight])
		}

		window.addEventListener('resize', updateDimensions)

		return () => window.removeEventListener('resize', updateDimensions)
	})

	return (
		<canvas
			ref={canvas}
			className={styles.canvas}
			width={screenDimensions[0]}
			height={screenDimensions[1]}
		/>
	)
})