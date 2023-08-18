import { Particle, ParticleSystem, Vector } from "../../lib/ParticleSystem";

export type Color = { r: number, g: number, b: number } | [r: number, g: number, b: number]

export default class FireworkParticleSystem extends ParticleSystem {
	constructor(
		location: Vector,
		private angleInDegrees: number,
		private color: Color,
		lifespan: number,
		lifespanDecrease: number
	) {
		super({ location, lifespan, lifespanDecrease })
	}

	/**
	 * Add two particles to the system with symmetrical velocity offset to the
	 * axis that the location vector represents.
	 */
	public addParticle(): void {
		const color = Array.isArray(this.color)
			? { r: this.color[0], g: this.color[1], b: this.color[2] }
			: this.color

		class FireworkParticle extends Particle {
			public draw(ctx: CanvasRenderingContext2D): void {
				const { x, y } = this.location
				const radius = Math.round(3 + 5 * this.relativeLifespan)

				const lifeSpanAlphaCutOff = 0.25
				const alpha = this.relativeLifespan > lifeSpanAlphaCutOff
					? 1
					: this.relativeLifespan > 0
						? (this.relativeLifespan / lifeSpanAlphaCutOff)
						: 0
				const fillColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`

				if (radius <= 0) {
					return
				}

				ctx.beginPath()
				ctx.fillStyle = fillColor
				ctx.ellipse(x, y, radius, radius, 0, 0, 360)
				ctx.fill()
				ctx.closePath()
			}
		}

		const angleDeviation = 10 + 10 * Math.random()

		// Add two to make it symmetrical.
		super.addParticle(new FireworkParticle({
			location: this.location.get(),
			velocity: Vector.fromDegreesAngle(this.angleInDegrees + angleDeviation).setMagnitude(1 + 2 * Math.random()),
			acceleration: new Vector(0.004 * Math.random() - 0.002, 0.004 * Math.random() - 0.002),
			lifespan: this.lifespan,
			lifespanDecrease: this.lifespanDecrease
		}))

		super.addParticle(new FireworkParticle({
			location: this.location.get(),
			velocity: Vector.fromDegreesAngle(this.angleInDegrees - angleDeviation).setMagnitude(1 + 2 * Math.random()),
			acceleration: new Vector(0.004 * Math.random() - 0.002, 0.004 * Math.random() - 0.002),
			lifespan: this.lifespan,
			lifespanDecrease: this.lifespanDecrease
		}))
	}
}