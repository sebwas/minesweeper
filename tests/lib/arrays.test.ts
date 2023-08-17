import { test, expect } from 'vitest'
import { reduceToSum } from '../../src/lib/arrays'

test('reduceToSum ignores non-numeric values', () => {
	const testArray = [1, 2, 3, 'a', { b: 'c' }, [6, 5], 4]

	// @ts-expect-error We are trying to test using invalid values here.
	expect(reduceToSum(testArray)).toBe(10)
})
