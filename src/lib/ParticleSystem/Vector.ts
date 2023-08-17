export default class Vector {
	constructor (private _x: number, private _y: number) {}

	get x() {
		return this._x
	}

	get y() {
		return this._y
	}

	get magnitude() {
		return Math.sqrt(this.x ** 2 + this.y ** 2)
	}

	get length() {
		return this.magnitude
	}

	get heading() {
		return Math.atan2(this.x, this.y)
	}

	get angle() {
		return this.heading
	}

	get angleInDegrees() {
		return this.angle * Math.PI / 180
	}

	public get() {
		return new Vector(this.x, this.y)
	}

	public toSimpleObject() {
		return { x: this.x, y: this.y }
	}

	public add(v: Vector) {
		return new Vector(this.x + v.x, this.y + v.y)
	}

	public sub(v: Vector) {
		return this.add(v.mult(-1))
	}

	public mult(factor: number) {
		return new Vector(factor * this.x, factor * this.y)
	}

	public div(factor: number) {
		if (factor === 0) {
			throw new Error('Cannot divide by 0.')
		}

		return this.mult(1 / factor)
	}

	public setMagnitude(magnitude: number) {
		return this.normalize().mult(magnitude)
	}

	public normalize() {
		return this.div(this.magnitude)
	}

	public limit(magnitude: number) {
		if (this.magnitude > magnitude) {
			return this.normalize().mult(magnitude)
		}
	}

	public rotate(angle: number) {
		return Vector.fromDegreesAngle(this.angleInDegrees + angle)
	}

	public dot(v: Vector) {
		return this.x * v.x + this.y * v.y
	}

	public distance(v: Vector) {
		return Math.sqrt(this.dot(v))
	}

	public angleTo(v: Vector) {
		const dot = this.dot(v);
		const theta = Math.acos(dot / (this.magnitude * v.magnitude));

		return theta;
	}

	public static fromRadiansAngle(a: number) {
		return new Vector(Math.cos(a), Math.sin(a))
	}

	public static fromDegreesAngle(a: number) {
		return Vector.fromRadiansAngle(a * 180 / Math.PI)
	}
}