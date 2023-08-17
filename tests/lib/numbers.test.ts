import { expect, describe, it } from 'vitest'
import { between, min0, limit } from '../../src/lib/numbers'

describe('the "between" helper function', () => {
	it('returns true if the value is between the two values', () => {
		expect(between(2, 1, 3)).toBe(true)
	})

	it('returns false if the value is less than the minimum', () => {
		expect(between(0, 1, 3)).toBe(false)
	})

	it('returns false if the value is greater than the maximum', () => {
		expect(between(4, 1, 3)).toBe(false)
	})

	it('returns true if the value is the same as the mininimum and maximum', () => {
		expect(between(1, 1, 1)).toBe(true)
	})

	it('returns true if the value is the same as the mininimum and maximum, but inclusivity is turned off', () => {
		expect(between(1, 1, 1, false)).toBe(false)
	})
})

describe('the "min0" helper function', () => {
	it('returns the number when the number is greater than 0', () => {
		expect(min0(1)).toBe(1)
	})

	it('returns 0 when the number is less than 0', () => {
		expect(min0(-1)).toBe(0)
	})
})

describe('the "limit" helper function', () => {
	it('returns the number when it\'s less than the compared value', () => {
		expect(limit(0, 1)).toBe(0)
	})

	it('returns the maximum when it\'s greater than the compared value', () => {
		expect(limit(2, 1)).toBe(1)
	})
})
