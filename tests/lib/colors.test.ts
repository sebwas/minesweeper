import { test, expect } from 'vitest'
import { hslToRgb } from '../../src/lib/colors'

test('it converts yellow correctly', () => {
	expect(hslToRgb(60, 100, 50)).toStrictEqual([255, 255, 0])
})
