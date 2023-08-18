import { Particle } from "../../lib/ParticleSystem"

import type { ParticleConstructorArgs } from "../../lib/ParticleSystem/Particle"
import type { Color } from "./FireworkParticleSystem"

export default class FireworkParticle extends Particle {
	private color: Color<false>

	public constructor(initialArgs: ParticleConstructorArgs, color: Color) {
		super(initialArgs)

		this.color = Array.isArray(color)
			? { r: color[0], g: color[1], b: color[2] }
			: color
	}

	public draw(ctx: CanvasRenderingContext2D): void {
		const { x, y } = this.location
		const radius = Math.round(3 + 5 * this.relativeLifespan)

		const lifeSpanAlphaCutOff = 0.25
		const alpha = this.relativeLifespan > lifeSpanAlphaCutOff
			? 1
			: this.relativeLifespan > 0
				? (this.relativeLifespan / lifeSpanAlphaCutOff)
				: 0
		const fillColor = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${alpha})`

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