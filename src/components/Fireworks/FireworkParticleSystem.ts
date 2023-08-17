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
		super(location, new Vector(0, 0), new Vector(0, 0), lifespan, lifespanDecrease)
	}

	public addParticle(): void {
		const color = Array.isArray(this.color)
			? { r: this.color[0], g: this.color[1], b: this.color[2] }
			: this.color

		class FireworkParticle extends Particle {
			public draw(ctx: CanvasRenderingContext2D): void {
				const relativeLifeSpan = this.lifespan / this.fullLifespan
				const { x, y } = this.location
				const radius = Math.round(3 + 5 * relativeLifeSpan)

				const lifeSpanAlphaCutOff = 0.3
				const alpha = relativeLifeSpan > lifeSpanAlphaCutOff
					? 1
					: relativeLifeSpan > 0
						? (lifeSpanAlphaCutOff / relativeLifeSpan)
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
		const velocityOne = Vector.fromDegreesAngle(this.angleInDegrees + angleDeviation)
		const velocityTwo = Vector.fromDegreesAngle(this.angleInDegrees - angleDeviation)

		// Add two to make it symmetrical.
		super.addParticle(new FireworkParticle(this.location.get(), velocityOne, new Vector(0.002, 0.002), this.lifespan, this.lifespanDecrease))
		super.addParticle(new FireworkParticle(this.location.get(), velocityTwo, new Vector(0.002, 0.002), this.lifespan, this.lifespanDecrease))
	}
}