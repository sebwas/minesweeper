import Vector from "./Vector";

export type ParticleConstructorArgs = {
	location?: Vector
	velocity?: Vector
	acceleration?: Vector
	lifespan?: number
	lifespanDecrease?: number
}

export default abstract class Particle {
	protected _location: Vector
	protected _velocity: Vector
	protected _acceleration: Vector | ((normalizedLifespan: number) => Vector)

	protected _fullLifespan
	protected _lifespan
	protected _lifespanDecrease

	private endOfLifeHandlers: Array<(p: Particle) => void> = []

	constructor({
		location = new Vector(0, 0),
		velocity = new Vector(0, 0),
		acceleration = new Vector(0, 0),
		lifespan = 255,
		lifespanDecrease = 1
	}: ParticleConstructorArgs = {}) {
		this._location = location
		this._velocity = velocity
		this._acceleration = acceleration
		this._fullLifespan = lifespan
		this._lifespan = lifespan
		this._lifespanDecrease = lifespanDecrease
	}

	get location() {
		return this._location
	}

	get velocity() {
		return this._velocity
	}

	get acceleration() {
		return this._acceleration
	}

	get fullLifespan() {
		return this._fullLifespan
	}

	get lifespan() {
		return this._lifespan
	}

	get lifespanDecrease() {
		return this._lifespanDecrease
	}

	get relativeLifespan() {
		return this.lifespan / this.fullLifespan
	}

	isEndOfLife() {
		const isEndOfLife = (this.lifespan <= 0)

		if (isEndOfLife) {
			this.handleEndOfLife()
		}

		return isEndOfLife
	}

	run(ctx: CanvasRenderingContext2D) {
		this.update()
		this.draw(ctx)
	}

	update() {
		if (this.isEndOfLife()) {
			return
		}

		let acceleration = this._acceleration

		if (typeof acceleration === 'function') {
			acceleration = acceleration(this._lifespan / this._fullLifespan)
		}

		this._velocity = this._velocity.add(acceleration)
		this._location = this._location.add(this._velocity)

		this._lifespan -= this._lifespanDecrease
	}

	abstract draw(ctx: CanvasRenderingContext2D): void;

	public addEndOfLifeHandler(handler: (p: Particle) => void) {
		this.endOfLifeHandlers.push(handler)
	}

	public removeEndOfLifeHandler(handler: (p: Particle) => void) {
		this.endOfLifeHandlers = this.endOfLifeHandlers.filter(h => h !== handler)
	}

	protected handleEndOfLife() {
		this.endOfLifeHandlers.forEach(h => h(this))
		this.endOfLifeHandlers = []
	}
}