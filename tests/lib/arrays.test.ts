import { describe, it, expect } from 'vitest'
import { chunkArray, reduceToSum } from '../../src/lib/arrays'

describe('The reduceToSum function', () => {
	it('gets the sum of the array elements', () => {
		const testArray = [1, 2, 3, 4]

		expect(reduceToSum(testArray)).toBe(10)
	})

	it('ignores non-numeric values', () => {
		const testArray = [1, 2, 3, 'a', { b: 'c' }, [6, 5], 4]

		// @ts-expect-error We are trying to test using invalid values here.
		expect(reduceToSum(testArray)).toBe(10)
	})
})

describe('The chunkArray function', () => {
	it('chunks an array into the defined chunks', () => {
		const testArray = [0, 0, 0, 0, 0, 0, 0, 0, 0]

		const chunked1 = chunkArray(testArray, 1)
		const chunked2 = chunkArray(testArray, 2)
		const chunked9 = chunkArray(testArray, 9)
		const chunked20 = chunkArray(testArray, 20)

		expect(chunked1).toStrictEqual([[0], [0], [0], [0], [0], [0], [0], [0], [0]])
		expect(chunked2).toStrictEqual([[0, 0], [0, 0], [0, 0], [0, 0], [0]])
		expect(chunked9).toStrictEqual([[0, 0, 0, 0, 0, 0, 0, 0, 0]])
		expect(chunked20).toStrictEqual([[0, 0, 0, 0, 0, 0, 0, 0, 0]])
	})

	it('does not alter the original array', () => {
		const testArray = [0, 0, 0, 0, 0, 0, 0, 0, 0]

		const chunked = chunkArray(testArray, 2)

		expect(chunked).not.toBe(testArray)
	})

	it('throws an error for a bad chunk size', () => {
		const testArray = [0, 0, 0, 0, 0, 0, 0, 0, 0]

		expect(() => chunkArray(testArray, 0)).toThrow('Chunk size invalid: must be larger than 0.')
		expect(() => chunkArray(testArray, -1)).toThrow('Chunk size invalid: must be larger than 0.')
	})
})
