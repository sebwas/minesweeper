import { expect, describe, it } from 'vitest'
import { Vector } from '../../../src/lib/ParticleSystem'

describe('The Vector class', () => {
	it('can convert into and from a simple object', () => {
		const vector = new Vector(1, 2)

		const simplified = vector.toSimpleObject()

		expect(simplified).toStrictEqual({ x: 1, y: 2 })
		expect(Vector.fromSimpleObject({ x: 1, y: 2 })).toStrictEqual(new Vector(1, 2))
	})

	it('can create a copy', () => {
		const vector = new Vector(1, 2)
		const comparison = vector.get()

		expect(vector.toSimpleObject()).toStrictEqual(comparison.toSimpleObject())
		expect(vector).not.toBe(comparison)
	})

	it('can add another vector', () => {
		const v1 = new Vector(1, 2)
		const v2 = new Vector(3, 4)

		expect(v1.add(v2).toSimpleObject()).toStrictEqual({ x: 4, y: 6 })
		expect(v1.add(v2)).not.toBe(v1)
	})

	it('can subtract another vector', () => {
		const v1 = new Vector(3, 4)
		const v2 = new Vector(1, 2)

		expect(v1.sub(v2).toSimpleObject()).toStrictEqual({ x: 2, y: 2 })
		expect(v1.sub(v2)).not.toBe(v1)
	})

	it('can scale by a factor', () => {
		const vector = new Vector(3, 4)

		expect(vector.mult(2).toSimpleObject()).toStrictEqual({ x: 6, y: 8 })
	})

	it('can get the magnitude', () => {
		const vector = new Vector(3, 4)

		expect(vector.magnitude).toBe(5)
	})

	it('can normalize the vector', () => {
		const vector = new Vector(1, 1)

		// The normalization comes up with some floating point issues.
		expect(vector.normalize().magnitude).toBeGreaterThanOrEqual(0.999999999999)
		expect(vector.normalize().magnitude).toBeLessThanOrEqual(1)
	})

	it('can set the magnitude', () => {
		const vector = new Vector(3, 9)

		const changed = vector.setMagnitude(2)

		expect(changed.toSimpleObject()).toStrictEqual(vector.normalize().mult(2).toSimpleObject())
		expect(vector.toSimpleObject()).toStrictEqual({ x: 3, y: 9 })
	})

	it('can limit the magnitude', () => {
		const vector = new Vector(3, 9)

		const changed = vector.limit(2)

		expect(changed.toSimpleObject()).toStrictEqual(vector.normalize().mult(2).toSimpleObject())
		expect(vector.toSimpleObject()).toStrictEqual({ x: 3, y: 9 })
	})

	it('can rotate the vector', () => {
		const vector = new Vector(2, 2)

		const changed = vector.rotate(90).normalize()

		expect(changed.angle).toStrictEqual(new Vector(2, -2).angle)
		expect(vector.toSimpleObject()).toStrictEqual({ x: 2, y: 2 })
	})

	it('can calculate the dot product with another vector', () => {
		const vectorOne = new Vector(2, 1)
		const vectorTwo = new Vector(1, 2)

		expect(vectorOne.dot(vectorTwo)).toBe(4)
	})

	it('can calculate the euclidian distance to another vector', () => {
		const vectorOne = new Vector(2, 1)
		const vectorTwo = new Vector(1, 2)

		expect(vectorOne.distance(vectorTwo)).toBe(2)
	})

	it('can calculate the angle to another vector', () => {
		const vectorOne = new Vector(2, 2)
		const vectorTwo = new Vector(1, -1)

		expect(vectorOne.angleTo(vectorTwo)).toBe(90 * Math.PI / 180)
		expect(vectorOne.angleToInDegrees(vectorTwo)).toBe(90)
	})

	it('can create a vector from an angle', () => {
		const vectorOne = Vector.fromDegreesAngle(90)
		const vectorTwo = Vector.fromRadiansAngle(90 * Math.PI / 180)

		expect(vectorOne.angle).toBe(90 * Math.PI / 180)
		expect(vectorTwo.angleInDegrees).toBe(90)
	})
})
