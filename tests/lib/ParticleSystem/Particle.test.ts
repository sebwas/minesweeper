import { expect, describe, it, vi } from 'vitest'
import { Particle, Vector } from '../../../src/lib/ParticleSystem'

describe('The Particle class', () => {
	class TestParticle extends Particle {
		public draw() {}
	}

	it('automatically decreases the life span when being updated', () => {
		const p = new TestParticle({ lifespan: 3, lifespanDecrease: 1 })

		p.update()
		p.update()
		p.update()

		expect(p.lifespan).toBe(0)
	})

	it('automatically decreases the life span by a specified amount when being updated', () => {
		const p = new TestParticle({ lifespan: 4, lifespanDecrease: 2 })

		p.update()
		p.update()

		expect(p.lifespan).toBe(0)
	})

	it('does not allow further updates once the particle has reached its end of life', () => {
		const p = new TestParticle({ lifespan: 1, lifespanDecrease: 1 })

		p.update()
		p.update()

		expect(p.lifespan).toBe(0)
	})

	it('adds the velocity to the location vector on update', () => {
		const p = new TestParticle({ velocity: new Vector(1, 1) })

		p.update()
		p.update()

		expect(p.location.toSimpleObject()).toStrictEqual({ x: 2, y: 2 })
	})

	it('adds the acceleration to the velocity vector on update', () => {
		const p = new TestParticle({ acceleration: new Vector(1, 1) })

		p.update()
		p.update()

		expect(p.velocity.toSimpleObject()).toStrictEqual({ x: 2, y: 2 })
	})

	it('allows to add an end of life handler', () => {
		const p = new TestParticle({ lifespan: 1, lifespanDecrease: 1 })

		const handler = vi.fn()

		p.addEndOfLifeHandler(handler)
		p.update()
		p.update()

		expect(handler.mock.calls.length).toBe(1)
		expect(handler.mock.calls[0][0]).toBe(p)
	})

	it('allows to remove an end of life handler', () => {
		const p = new TestParticle({ lifespan: 1, lifespanDecrease: 1 })

		const handler = vi.fn()

		p.addEndOfLifeHandler(handler)
		p.removeEndOfLifeHandler(handler)
		p.update()
		p.update()

		expect(handler.mock.calls.length).toBe(0)
	})

	it('makes sure to only call the end of life handler once by removing them once done', () => {
		const p = new TestParticle({ lifespan: 1, lifespanDecrease: 1 })

		// @ts-expect-error handleEndOfLife is protected, therefore TS will complain.
		const handleEndOfLife = vi.spyOn(p, 'handleEndOfLife')

		const handler = vi.fn()

		p.addEndOfLifeHandler(handler)
		p.update()
		p.update()

		expect(handler.mock.calls.length).toBe(1)
		expect(handler.mock.calls[0][0]).toBe(p)

		p.update()
		p.update()

		expect(handleEndOfLife).toHaveBeenCalledTimes(3)
		expect(handler.mock.calls.length).toBe(1)
		expect(handler.mock.calls[0][0]).toBe(p)
	})

	it('provides the relative lifespan', () => {
		const p = new TestParticle({ lifespan: 2, lifespanDecrease: 1 })

		p.update()

		expect(p.relativeLifespan).toBe(0.5)
	})
})
