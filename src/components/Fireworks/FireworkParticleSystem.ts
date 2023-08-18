import { ParticleSystem, Vector } from "../../lib/ParticleSystem";
import FireworkParticle from "./FireworkParticle";

export type Color<AllowArrayNotation extends boolean = true> =
	{ r: number, g: number, b: number }
	| (
		AllowArrayNotation extends true
			? [r: number, g: number, b: number]
			: never
	)

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
		const angleDeviation = 10 + 10 * Math.random()

		// Add two to make it symmetrical.
		super.addParticle(
			new FireworkParticle(
				{
					location: this.location.get(),
					velocity: Vector.fromDegreesAngle(this.angleInDegrees + angleDeviation).setMagnitude(1 + 2 * Math.random()),
					acceleration: new Vector(0.004 * Math.random() - 0.002, 0.004 * Math.random() - 0.002),
					lifespan: this.lifespan,
					lifespanDecrease: this.lifespanDecrease
				},
				this.color
			)
		)

		super.addParticle(
			new FireworkParticle(
				{
					location: this.location.get(),
					velocity: Vector.fromDegreesAngle(this.angleInDegrees - angleDeviation).setMagnitude(1 + 2 * Math.random()),
					acceleration: new Vector(0.004 * Math.random() - 0.002, 0.004 * Math.random() - 0.002),
					lifespan: this.lifespan,
					lifespanDecrease: this.lifespanDecrease
				},
				this.color
			)
		)
	}
}