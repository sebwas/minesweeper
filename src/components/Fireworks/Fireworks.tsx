import React, { PropsWithChildren } from 'react'

import FireworkParticleSystem from './FireworkParticleSystem'
import { ParticleSystem, Vector } from '../../lib/ParticleSystem'
import { hslToRgb } from '../../lib/colors'

import styles from './Fireworks.module.css'

type FireworksContextApi = {
	startFireworks({
		fireworkCount,
		additionalRounds
	}?: {
		fireworkCount?: number,
		additionalRounds?: number
	}): void
}

const FireworksContext = React.createContext<FireworksContextApi>({} as FireworksContextApi)

export function useFireworks() {
	return React.useContext(FireworksContext)
}

export default function FireworksProvider(
	{
		children,
		playfieldRef
	}: PropsWithChildren<{
		playfieldRef: React.RefObject<HTMLDivElement>
	}>
) {
	const canvas = React.useRef<HTMLCanvasElement>(null)

	const startFireworks = React.useCallback(
		function startFireworks(
			{
				fireworkCount = 8,
				additionalRounds = 2
			}: undefined | {
				fireworkCount?: number,
				additionalRounds?: number
			} = {}
		) {
			const playfield = playfieldRef.current

			if (!playfield) {
				throw new Error('Cannot start fireworks, because the playfield is missing.')
			}

			const playfieldRect = playfield.getBoundingClientRect()

			// These initial locations are on either top corner of the playfield,
			// which is the whole game container. They are supposed to have a
			// few pixels of offset from their respective corner and a slightly
			// randomized angle that goes with the diagonal running through the
			// corner.
			const initialLocations = [
				{
					startLocation: () => new Vector(
						playfieldRect.x + -20 * Math.random(),
						playfieldRect.y + -20 * Math.random()
					),
					angle: () => (Math.random() * 60 - 30) - 135
				},

				{
					startLocation: () => new Vector(
						playfieldRect.x + playfieldRect.width + 20 * Math.random(),
						playfieldRect.y + -20 * Math.random()
					),
					angle: () => (Math.random() * 60 - 30) - 45
				},
			]

			const ctx = canvas?.current?.getContext('2d') as CanvasRenderingContext2D

			const ps = new ParticleSystem().setIsRootPs()

			for (let i = 0; i < fireworkCount; i++) {
				// Take either the top left or top right corner as starting point.
				const startingPoint = initialLocations[Number(Math.random() >= 0.5)]

				ps.addParticle(
					addFireworks(
						startingPoint.startLocation(),
						startingPoint.angle()
					)
				)
			}

			// After the fireworks are done, launch a new set until we run out
			// of additional rounds to be fired.
			if (additionalRounds) {
				ps.addEndOfLifeHandler(
					() => startFireworks({ fireworkCount, additionalRounds: additionalRounds - 1 })
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
		[canvas, playfieldRef]
	)

	function addFireworks(
		{ x, y }: { x: number, y: number },
		angle: number,
		fireworkParticleCount = 5 + 5 * Math.random()
	) {
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

const Fireworks = React.forwardRef<HTMLCanvasElement>(
	function Fireworks(_, canvas) {
		const [
			screenDimensions,
			setScreenDimensions
		] = React.useState([window.innerWidth, window.innerHeight])

		React.useEffect(() => {
			function updateDimensions() {
				setScreenDimensions([window.innerWidth, window.innerHeight])
			}

			window.addEventListener('resize', updateDimensions)

			return () => window.removeEventListener('resize', updateDimensions)
		})

		return (
			<canvas
				data-testid="canvas"
				ref={canvas}
				className={styles.canvas}
				width={screenDimensions[0]}
				height={screenDimensions[1]}
			/>
		)
	}
)