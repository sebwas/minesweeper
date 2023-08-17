import Particle from "./Particle";

export default class ParticleSystem extends Particle {
	private particles: Particle[] = []
	private _isRootPs = false

	get isRootPs() {
		return this._isRootPs
	}

	public addParticle(p: Particle) {
		this.particles.push(p)
	}

	public update() {
		super.update()

		this.particles.forEach(p => p.update())
	}

	public draw(ctx: CanvasRenderingContext2D) {
		if (this.isRootPs) {
			ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
		}

		this.particles.forEach(p => {
			p.draw(ctx)
		})
	}

	public setIsRootPs(isRootPs = true) {
		this._isRootPs = isRootPs
	}
}
