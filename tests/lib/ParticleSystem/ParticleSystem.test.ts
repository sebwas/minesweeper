import { expect, describe, it, vi, test } from 'vitest'
import { Particle, ParticleSystem } from '../../../src/lib/ParticleSystem'

describe('The ParticleSystem class', () => {
	type SimplifiedCanvasRenderingContext2D = Partial<
		Omit<CanvasRenderingContext2D, 'canvas'>
		& { canvas: { width: number, height: number } }
	>

	class TestParticle extends Particle {
		public draw() {}
	}

	class TestParticleSystem extends ParticleSystem {
		public draw(mockContext?: SimplifiedCanvasRenderingContext2D) {
			// @ts-expect-error We don't need any real canvas context in our tests.
			super.draw(mockContext)
		}
	}

	it('calls the update function of all its particles on update', () => {
		const ps = new TestParticleSystem()

		const p1 = new TestParticle()
		const p2 = new TestParticle()

		ps.addParticle(p1)
		ps.addParticle(p2)

		const p1Spy = vi.spyOn(p1, 'update')
		const p2Spy = vi.spyOn(p2, 'update')

		ps.update()

		expect(p1Spy).toHaveBeenCalledOnce()
		expect(p2Spy).toHaveBeenCalledOnce()

		ps.update()

		expect(p1Spy).toHaveBeenCalledTimes(2)
		expect(p2Spy).toHaveBeenCalledTimes(2)
	})

	it('calls the draw function of all its particles on draw', () => {
		const ps = new TestParticleSystem()

		const p1 = new TestParticle()
		const p2 = new TestParticle()

		ps.addParticle(p1)
		ps.addParticle(p2)

		const p1Spy = vi.spyOn(p1, 'draw')
		const p2Spy = vi.spyOn(p2, 'draw')

		ps.draw()

		expect(p1Spy).toHaveBeenCalledOnce()
		expect(p2Spy).toHaveBeenCalledOnce()

		ps.draw()

		expect(p1Spy).toHaveBeenCalledTimes(2)
		expect(p2Spy).toHaveBeenCalledTimes(2)
	})

	test('when it\'s a root particle system, it clears the canvas before drawing its particles', () => {
		const ps = new TestParticleSystem().setIsRootPs(true)

		const p1 = new TestParticle()
		const p2 = new TestParticle()

		ps.addParticle(p1)
		ps.addParticle(p2)

		const p1Spy = vi.spyOn(p1, 'draw')
		const p2Spy = vi.spyOn(p2, 'draw')

		const simplifiedContext: SimplifiedCanvasRenderingContext2D = {
			canvas: {
				width: 100,
				height: 200
			},

			clearRect(x, y, w, h) {
				[x, y, w, h]

				return
			},
		}

		const clearRectSpy = vi.spyOn(simplifiedContext, 'clearRect')

		ps.draw(simplifiedContext)

		expect(clearRectSpy).toHaveBeenCalledOnce()
		expect(clearRectSpy).toHaveBeenLastCalledWith(0, 0, 100, 200)
		expect(p1Spy).toHaveBeenCalledWith(simplifiedContext)
		expect(p2Spy).toHaveBeenCalledWith(simplifiedContext)
	})
})
