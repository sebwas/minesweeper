import { describe, it, expect } from 'vitest'
import { copyGrid, createEmptyGrid, createGameGrids, fromSaveState, handleClick, toSaveState } from '../../src/lib/game'
import type { GameGrids } from '../../src/lib/game'
import GameError, { FieldIsFlaggedField, FieldIsMineField, FieldIsNotCovered } from '../../src/lib/errors'

describe('The createEmptyGrids function', () => {
	it('creates a grid of specified size with a default initial value', () => {
		const grid = createEmptyGrid({ width: 4, height: 3 })

		expect(grid).toHaveLength(3)
		expect(grid[0]).toHaveLength(4)
		expect(grid).toStrictEqual([
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		])
	})

	it('creates a grid of specified size with an initial value', () => {
		const grid = createEmptyGrid({ width: 4, height: 3 }, 1)

		expect(grid).toHaveLength(3)
		expect(grid[0]).toHaveLength(4)
		expect(grid).toStrictEqual([
			[1, 1, 1, 1],
			[1, 1, 1, 1],
			[1, 1, 1, 1],
		])
	})
})

describe('The createGameGrids function', () => {
	it('creates four grid layers of the specified size', () => {
		const grids = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

		const layers = Object.keys(grids)

		expect(layers).toHaveLength(4)
		expect(layers).toContain('mine')
		expect(layers).toContain('cover')
		expect(layers).toContain('flag')
		expect(layers).toContain('mineCount')

		expect(grids.mine).toHaveLength(5)
		expect(grids.mine[0]).toHaveLength(5)

		expect(grids.cover).toHaveLength(5)
		expect(grids.cover[0]).toHaveLength(5)

		expect(grids.flag).toHaveLength(5)
		expect(grids.flag[0]).toHaveLength(5)

		expect(grids.mineCount).toHaveLength(5)
		expect(grids.mineCount[0]).toHaveLength(5)
	})

	it('throws an exception if the requested amount of mines cannot be set in accordance with the perimeter', () => {
		expect(
			() => createGameGrids({ width: 16, height: 16 }, 247, { x: 5, y: 7 })
		).not.toThrowError(GameError.mineCountTooHighText)

		expect(
			() => createGameGrids({ width: 16, height: 16 }, 248, { x: 5, y: 7 })
		).toThrowError(GameError.mineCountTooHighText)

		expect(
			() => createGameGrids({ width: 16, height: 16 }, 248, { x: 5, y: 7 }, 2)
		).toThrowError(GameError.mineCountTooHighText)

		expect(
			() => createGameGrids({ width: 16, height: 16 }, 31, { x: 5, y: 7 }, 2)
		).not.toThrowError(GameError.mineCountTooHighText)

		expect(
			() => createGameGrids({ width: 16, height: 16 }, 250, { x: 0, y: 7 })
		).not.toThrowError(GameError.mineCountTooHighText)

		expect(
			() => createGameGrids({ width: 16, height: 16 }, 251, { x: 0, y: 7 })
		).toThrowError(GameError.mineCountTooHighText)

		expect(
			() => createGameGrids({ width: 16, height: 16 }, 250, { x: 7, y: 0 })
		).not.toThrowError(GameError.mineCountTooHighText)

		expect(
			() => createGameGrids({ width: 16, height: 16 }, 251, { x: 7, y: 0 })
		).toThrowError(GameError.mineCountTooHighText)
	})

	describe('the generated mine count grid', () => {
		it('perfectly generates a perimeter devoid of mines in the center', () => {
			const { mineCount } = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

			expect(mineCount).toStrictEqual([
				[9, 9, 9, 9, 9],
				[9, 5, 3, 5, 9],
				[9, 3, 0, 3, 9],
				[9, 5, 3, 5, 9],
				[9, 9, 9, 9, 9],
			])
		})

		it('perfectly generates a perimeter devoid of mines in the corners', () => {
			let { mineCount } = createGameGrids({ width: 3, height: 3 }, 5, { x: 0, y: 0 })

			expect(mineCount).toStrictEqual([
				[0, 2, 9],
				[2, 5, 9],
				[9, 9, 9],
			])

				; ({ mineCount } = createGameGrids({ width: 3, height: 3 }, 5, { x: 2, y: 0 }))

			expect(mineCount).toStrictEqual([
				[9, 2, 0],
				[9, 5, 2],
				[9, 9, 9],
			])

				; ({ mineCount } = createGameGrids({ width: 3, height: 3 }, 5, { x: 0, y: 2 }))

			expect(mineCount).toStrictEqual([
				[9, 9, 9],
				[2, 5, 9],
				[0, 2, 9],
			])

				; ({ mineCount } = createGameGrids({ width: 3, height: 3 }, 5, { x: 2, y: 2 }))

			expect(mineCount).toStrictEqual([
				[9, 9, 9],
				[9, 5, 2],
				[9, 2, 0],
			])
		})

		it('perfectly generates a perimeter devoid of mines neither in the corners, nor in the center', () => {
			const { mineCount } = createGameGrids({ width: 16, height: 16 }, 247, { x: 5, y: 7 })

			const slice = [
				mineCount[5].slice(3, 8),
				mineCount[6].slice(3, 8),
				mineCount[7].slice(3, 8),
				mineCount[8].slice(3, 8),
				mineCount[9].slice(3, 8),
			]

			expect(slice).toStrictEqual([
				[9, 9, 9, 9, 9],
				[9, 5, 3, 5, 9],
				[9, 3, 0, 3, 9],
				[9, 5, 3, 5, 9],
				[9, 9, 9, 9, 9],
			])
		})

		it('perfectly generates a perimeter devoid of mines in different sizes', () => {
			let { mineCount } = createGameGrids({ width: 16, height: 16 }, 255, { x: 5, y: 7 }, 0)

			const slicePerimeter0 = [
				mineCount[5].slice(3, 8),
				mineCount[6].slice(3, 8),
				mineCount[7].slice(3, 8),
				mineCount[8].slice(3, 8),
				mineCount[9].slice(3, 8),
			]

			expect(slicePerimeter0).toStrictEqual([
				[9, 9, 9, 9, 9],
				[9, 9, 9, 9, 9],
				[9, 9, 8, 9, 9],
				[9, 9, 9, 9, 9],
				[9, 9, 9, 9, 9],
			])

				; ({ mineCount } = createGameGrids({ width: 16, height: 16 }, 231, { x: 5, y: 7 }, 2))

			const slicePerimeter2 = [
				mineCount[5].slice(3, 8),
				mineCount[6].slice(3, 8),
				mineCount[7].slice(3, 8),
				mineCount[8].slice(3, 8),
				mineCount[9].slice(3, 8),
			]

			expect(slicePerimeter2).toStrictEqual([
				[5, 3, 3, 3, 5],
				[3, 0, 0, 0, 3],
				[3, 0, 0, 0, 3],
				[3, 0, 0, 0, 3],
				[5, 3, 3, 3, 5],
			])

				; ({ mineCount } = createGameGrids({ width: 16, height: 16 }, 247, { x: 0, y: 0 }, 2))

			const slicePerimeter2Corner = [
				mineCount[0].slice(0, 4),
				mineCount[1].slice(0, 4),
				mineCount[2].slice(0, 4),
				mineCount[3].slice(0, 4),
			]

			expect(slicePerimeter2Corner).toStrictEqual([
				[0, 0, 2, 9],
				[0, 0, 3, 9],
				[2, 3, 5, 9],
				[9, 9, 9, 9],
			])

				; ({ mineCount } = createGameGrids({ width: 16, height: 16 }, 241, { x: 5, y: 0 }, 2))

			const slicePerimeter2Edge = [
				mineCount[0].slice(2, 9),
				mineCount[1].slice(2, 9),
				mineCount[2].slice(2, 9),
				mineCount[3].slice(2, 9),
			]

			expect(slicePerimeter2Edge).toStrictEqual([
				[9, 2, 0, 0, 0, 2, 9],
				[9, 3, 0, 0, 0, 3, 9],
				[9, 5, 3, 3, 3, 5, 9],
				[9, 9, 9, 9, 9, 9, 9],
			])
		})
	})

	describe('the generated mine grid', () => {
		it('perfectly generates a perimeter devoid of mines in the center', () => {
			const { mine } = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

			expect(mine).toStrictEqual([
				[1, 1, 1, 1, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 1, 1, 1, 1],
			])
		})

		it('perfectly generates a perimeter devoid of mines in the corners', () => {
			let { mine } = createGameGrids({ width: 3, height: 3 }, 5, { x: 0, y: 0 })

			expect(mine).toStrictEqual([
				[0, 0, 1],
				[0, 0, 1],
				[1, 1, 1],
			])

				; ({ mine } = createGameGrids({ width: 3, height: 3 }, 5, { x: 2, y: 0 }))

			expect(mine).toStrictEqual([
				[1, 0, 0],
				[1, 0, 0],
				[1, 1, 1],
			])

				; ({ mine } = createGameGrids({ width: 3, height: 3 }, 5, { x: 0, y: 2 }))

			expect(mine).toStrictEqual([
				[1, 1, 1],
				[0, 0, 1],
				[0, 0, 1],
			])

				; ({ mine } = createGameGrids({ width: 3, height: 3 }, 5, { x: 2, y: 2 }))

			expect(mine).toStrictEqual([
				[1, 1, 1],
				[1, 0, 0],
				[1, 0, 0],
			])
		})

		it('perfectly generates a perimeter devoid of mines neither in the corners, nor in the center', () => {
			const { mine } = createGameGrids({ width: 16, height: 16 }, 247, { x: 5, y: 7 })

			const slice = [
				mine[5].slice(3, 8),
				mine[6].slice(3, 8),
				mine[7].slice(3, 8),
				mine[8].slice(3, 8),
				mine[9].slice(3, 8),
			]

			expect(slice).toStrictEqual([
				[1, 1, 1, 1, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 1, 1, 1, 1],
			])
		})

		it('perfectly generates a perimeter devoid of mines in different sizes', () => {
			let { mine } = createGameGrids({ width: 16, height: 16 }, 255, { x: 5, y: 7 }, 0)

			const slicePerimeter0 = [
				mine[5].slice(3, 8),
				mine[6].slice(3, 8),
				mine[7].slice(3, 8),
				mine[8].slice(3, 8),
				mine[9].slice(3, 8),
			]

			expect(slicePerimeter0).toStrictEqual([
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 0, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
			])

				; ({ mine } = createGameGrids({ width: 16, height: 16 }, 231, { x: 5, y: 7 }, 2))

			const slicePerimeter2 = [
				mine[4].slice(2, 9),
				mine[5].slice(2, 9),
				mine[6].slice(2, 9),
				mine[7].slice(2, 9),
				mine[8].slice(2, 9),
				mine[9].slice(2, 9),
				mine[10].slice(2, 9),
			]

			expect(slicePerimeter2).toStrictEqual([
				[1, 1, 1, 1, 1, 1, 1],
				[1, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 1],
				[1, 1, 1, 1, 1, 1, 1],
			])

				; ({ mine } = createGameGrids({ width: 16, height: 16 }, 247, { x: 0, y: 0 }, 2))

			const slicePerimeter2Corner = [
				mine[0].slice(0, 4),
				mine[1].slice(0, 4),
				mine[2].slice(0, 4),
				mine[3].slice(0, 4),
			]

			expect(slicePerimeter2Corner).toStrictEqual([
				[0, 0, 0, 1],
				[0, 0, 0, 1],
				[0, 0, 0, 1],
				[1, 1, 1, 1],
			])

				; ({ mine } = createGameGrids({ width: 16, height: 16 }, 241, { x: 5, y: 0 }, 2))

			const slicePerimeter2Edge = [
				mine[0].slice(2, 9),
				mine[1].slice(2, 9),
				mine[2].slice(2, 9),
				mine[3].slice(2, 9),
			]

			expect(slicePerimeter2Edge).toStrictEqual([
				[1, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 1],
				[1, 0, 0, 0, 0, 0, 1],
				[1, 1, 1, 1, 1, 1, 1],
			])
		})
	})

	describe('the generated cover grid', () => {
		it('generates a perfectly covered grid', () => {
			const { cover } = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

			expect(cover).toStrictEqual([
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
			])
		})

		it('generates a perfectly covered grid, no matter how many mines have to be set', () => {
			let { cover } = createGameGrids({ width: 5, height: 5 }, 0, { x: 2, y: 2 })

			expect(cover).toStrictEqual([
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
			])

				; ({ cover } = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 }))

			expect(cover).toStrictEqual([
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
			])
		})

		it('generates a perfectly covered grid, no matter where the spare field is set', () => {
			let { cover } = createGameGrids({ width: 5, height: 5 }, 16, { x: 0, y: 0 })

			expect(cover).toStrictEqual([
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
			])

				; ({ cover } = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 }))

			expect(cover).toStrictEqual([
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
				[1, 1, 1, 1, 1],
			])
		})
	})

	describe('the generated flag grid', () => {
		it('generates a perfectly unflagged grid', () => {
			const { flag } = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

			expect(flag).toStrictEqual([
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
			])
		})

		it('generates a perfectly unflagged grid, no matter how many mines have to be set', () => {
			let { flag } = createGameGrids({ width: 5, height: 5 }, 0, { x: 2, y: 2 })

			expect(flag).toStrictEqual([
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
			])

				; ({ flag } = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 }))

			expect(flag).toStrictEqual([
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
			])
		})

		it('generates a perfectly unflagged grid, no matter where the spare field is set', () => {
			let { flag } = createGameGrids({ width: 5, height: 5 }, 16, { x: 0, y: 0 })

			expect(flag).toStrictEqual([
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
			])

				; ({ flag } = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 }))

			expect(flag).toStrictEqual([
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
				[0, 0, 0, 0, 0],
			])
		})
	})
})

describe('The copyGrid function', () => {
	it('creates an exact copy', () => {
		const grid = [
			[0, 0, 0, 1, 0, 0, 0],
			[0, 0, 0, 1, 0, 0, 0],
			[0, 0, 0, 1, 0, 0, 0],
			[1, 1, 1, 1, 1, 1, 1],
			[0, 0, 0, 1, 0, 0, 0],
			[0, 0, 0, 1, 0, 0, 0],
			[0, 0, 0, 1, 0, 0, 0],
		]

		const copy = copyGrid(grid)

		expect(copy).toStrictEqual(grid)
		expect(copy).not.toBe(grid)
	})
})

describe('The handleClick function', () => {
	function insertAtPosition<T extends number>(grid: MineGrid<T>, position: Coordinates, value: T) {
		const copiedGrid = copyGrid(grid)

		copiedGrid[position.y][position.x] = value

		return copiedGrid
	}

	function insertValues<T extends number>(grid: MineGrid<T>, values: Record<`${number}-${number}`, T>) {
		return Object.entries(values).reduce((grid, [position, value]) => {
			const [x, y] = [
				Number(position.split('-').at(0)),
				Number(position.split('-').at(1)),
			]

			return insertAtPosition(grid, { x, y }, value)
		}, grid)
	}

	describe('the grid validity check', () => {
		describe('missing grids', () => {
			Object.entries({
				'missing mine grid': {
					flag: createEmptyGrid({ width: 4, height: 4 }),
					mineCount: createEmptyGrid({ width: 4, height: 4 }),
					cover: createEmptyGrid({ width: 4, height: 4 }),
				},
				'missing mineCount grid': {
					flag: createEmptyGrid({ width: 4, height: 4 }),
					mine: createEmptyGrid({ width: 4, height: 4 }),
					cover: createEmptyGrid({ width: 4, height: 4 }),
				},
				'missing flag grid': {
					mine: createEmptyGrid({ width: 4, height: 4 }),
					mineCount: createEmptyGrid({ width: 4, height: 4 }),
					cover: createEmptyGrid({ width: 4, height: 4 }),
				},
				'missing cover grid': {
					flag: createEmptyGrid({ width: 4, height: 4 }),
					mineCount: createEmptyGrid({ width: 4, height: 4 }),
					mine: createEmptyGrid({ width: 4, height: 4 }),
				},
			}).forEach(([test, grids]) => {
				it(`throws an error when the supplied grids are not valid: ${test}`, () => {
					expect(
						// @ts-expect-error We are trying to check invalid values here.
						() => handleClick(grids, { x: 0, y: 0 }, false)
					).toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.MISSING_GRID))
				})
			})

			it('does not throw an error when the supplied grids are valid', () => {
				expect(
					() => handleClick({
						flag: createEmptyGrid({ width: 4, height: 4 }),
						mineCount: createEmptyGrid({ width: 4, height: 4 }),
						mine: createEmptyGrid({ width: 4, height: 4 }),
						cover: createEmptyGrid({ width: 4, height: 4 }),
					}, { x: 0, y: 0 }, false)
				).not.toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.MISSING_GRID))
			})
		})

		describe('dimension mismatch', () => {
			Object.entries({
				'mismatch mine grid': {
					mine: <MineGrid<0 | 1>>createEmptyGrid({ width: 2, height: 2 }),
					flag: <MineGrid<0 | 1>>createEmptyGrid({ width: 4, height: 4 }),
					mineCount: <MineGrid<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>>createEmptyGrid({ width: 4, height: 4 }),
					cover: <MineGrid<0 | 1>>createEmptyGrid({ width: 4, height: 4 }),
				},
				'mismatch flag grid': {
					mine: <MineGrid<0 | 1>>createEmptyGrid({ width: 4, height: 4 }),
					flag: <MineGrid<0 | 1>>createEmptyGrid({ width: 2, height: 2 }),
					mineCount: <MineGrid<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>>createEmptyGrid({ width: 4, height: 4 }),
					cover: <MineGrid<0 | 1>>createEmptyGrid({ width: 4, height: 4 }),
				},
				'mismatch mineCount grid': {
					mine: <MineGrid<0 | 1>>createEmptyGrid({ width: 4, height: 4 }),
					flag: <MineGrid<0 | 1>>createEmptyGrid({ width: 4, height: 4 }),
					mineCount: <MineGrid<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>>createEmptyGrid({ width: 2, height: 2 }),
					cover: <MineGrid<0 | 1>>createEmptyGrid({ width: 4, height: 4 }),
				},
				'mismatch cover grid': {
					mine: <MineGrid<0 | 1>>createEmptyGrid({ width: 4, height: 4 }),
					flag: <MineGrid<0 | 1>>createEmptyGrid({ width: 4, height: 4 }),
					mineCount: <MineGrid<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>>createEmptyGrid({ width: 4, height: 4 }),
					cover: <MineGrid<0 | 1>>createEmptyGrid({ width: 2, height: 2 }),
				},
			}).forEach(([test, grids]) => {
				it(`throws an error when the supplied grids are not valid: ${test}`, () => {
					expect(
						() => handleClick(grids, { x: 0, y: 0 }, false)
					).toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.DIMENSION_MISMATCH))
				})
			})

			it('does not throw an error when the supplied grids are valid', () => {
				expect(
					() => handleClick({
						mine: createEmptyGrid({ width: 4, height: 4 }),
						flag: createEmptyGrid({ width: 4, height: 4 }),
						mineCount: createEmptyGrid({ width: 4, height: 4 }),
						cover: createEmptyGrid({ width: 4, height: 4 }),
					}, { x: 0, y: 0 }, false)
				).not.toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.DIMENSION_MISMATCH))
			})
		})

		it('throws an error when the mine grid has bad values', () => {
			const grids: GameGrids = {
				mine: createEmptyGrid({ width: 4, height: 4 }),
				flag: createEmptyGrid({ width: 4, height: 4 }),
				mineCount: createEmptyGrid({ width: 4, height: 4 }),
				cover: createEmptyGrid({ width: 4, height: 4 }),
			}

			// @ts-expect-error We assign an invalid value on purpose.
			grids.mine[0][0] = 3

			expect(
				() => handleClick(grids, { x: 0, y: 0 }, false)
			).toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_MINE_GRID))

			grids.mine[0][0] = 1

			expect(
				() => handleClick(grids, { x: 0, y: 0 }, false)
			).not.toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_MINE_GRID))
		})

		it('throws an error when the flag grid has bad values', () => {
			const grids: GameGrids = {
				mine: createEmptyGrid({ width: 4, height: 4 }),
				flag: createEmptyGrid({ width: 4, height: 4 }),
				mineCount: createEmptyGrid({ width: 4, height: 4 }),
				cover: createEmptyGrid({ width: 4, height: 4 }),
			}

			// @ts-expect-error We assign an invalid value on purpose.
			grids.flag[0][0] = 3

			expect(
				() => handleClick(grids, { x: 0, y: 0 }, false)
			).toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_FLAG_GRID))

			grids.flag[0][0] = 1

			expect(
				() => handleClick(grids, { x: 0, y: 0 }, false)
			).not.toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_FLAG_GRID))
		})

		it('throws an error when the mine count grid has bad values', () => {
			const grids: GameGrids = {
				mine: createEmptyGrid({ width: 4, height: 4 }),
				flag: createEmptyGrid({ width: 4, height: 4 }),
				mineCount: createEmptyGrid({ width: 4, height: 4 }),
				cover: createEmptyGrid({ width: 4, height: 4 }),
			}

			// @ts-expect-error We assign an invalid value on purpose.
			grids.mineCount[0][0] = 10

			expect(
				() => handleClick(grids, { x: 0, y: 0 }, false)
			).toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_MINE_COUNT_GRID))

			grids.mineCount[0][0] = 1

			expect(
				() => handleClick(grids, { x: 0, y: 0 }, false)
			).not.toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_MINE_COUNT_GRID))
		})

		it('throws an error when the cover grid has bad values', () => {
			const grids: GameGrids = {
				mine: createEmptyGrid({ width: 4, height: 4 }),
				flag: createEmptyGrid({ width: 4, height: 4 }),
				mineCount: createEmptyGrid({ width: 4, height: 4 }),
				cover: createEmptyGrid({ width: 4, height: 4 }),
			}

			// @ts-expect-error We assign an invalid value on purpose.
			grids.cover[0][0] = 3

			expect(
				() => handleClick(grids, { x: 0, y: 0 }, false)
			).toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_COVER_GRID))

			grids.cover[0][0] = 1

			expect(
				() => handleClick(grids, { x: 0, y: 0 }, false)
			).not.toThrow(new RegExp(GameError.gameGridsAreInvalidReasons.UNEXPECTED_VALUES_COVER_GRID))
		})
	})

	it('toggles a flag', () => {
		const grids: GameGrids = {
			mine: createEmptyGrid({ width: 3, height: 3 }),
			flag: createEmptyGrid({ width: 3, height: 3 }),
			mineCount: createEmptyGrid({ width: 3, height: 3 }),
			cover: createEmptyGrid({ width: 3, height: 3 }, 1),
		}

		const toggledOn = handleClick(grids, { x: 1, y: 1 }, true)

		expect(grids).not.toBe(toggledOn)
		expect(toggledOn.cover).not.toBe(grids.cover)
		expect(toggledOn.cover).toStrictEqual(grids.cover)
		expect(toggledOn.mineCount).not.toBe(grids.mineCount)
		expect(toggledOn.mineCount).toStrictEqual(grids.mineCount)
		expect(toggledOn.mine).not.toBe(grids.mine)
		expect(toggledOn.mine).toStrictEqual(grids.mine)
		expect(toggledOn.flag).toStrictEqual([
			[0, 0, 0],
			[0, 1, 0],
			[0, 0, 0],
		])

		const toggledOff = handleClick(toggledOn, { x: 1, y: 1 }, true)

		expect(grids).not.toBe(toggledOn)
		expect(toggledOff.cover).not.toBe(grids.cover)
		expect(toggledOff.cover).not.toBe(toggledOn.cover)
		expect(toggledOff.cover).toStrictEqual(grids.cover)
		expect(toggledOff.mineCount).not.toBe(grids.mineCount)
		expect(toggledOff.mineCount).not.toBe(toggledOn.mineCount)
		expect(toggledOff.mineCount).toStrictEqual(grids.mineCount)
		expect(toggledOff.mine).not.toBe(grids.mine)
		expect(toggledOff.mine).not.toBe(toggledOn.mine)
		expect(toggledOff.mine).toStrictEqual(grids.mine)
		expect(toggledOff.flag).toStrictEqual([
			[0, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		])
	})

	it('does not toggle a flag when the field is uncovered', () => {
		const grids: GameGrids = {
			mine: createEmptyGrid({ width: 3, height: 3 }),
			flag: createEmptyGrid({ width: 3, height: 3 }),
			mineCount: createEmptyGrid({ width: 3, height: 3 }),
			cover: insertValues(createEmptyGrid({ width: 3, height: 3 }, 1), {
				'1-1': 0,
			}),
		}

		expect(
			() => handleClick(grids, { x: 1, y: 1 }, true)
		).toThrow(FieldIsNotCovered)
	})

	it('uncovers fields that have a number', () => {
		const grids: GameGrids = {
			mine: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 1,
			}),
			flag: createEmptyGrid({ width: 3, height: 3 }),
			mineCount: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 9,
				'0-1': 1,
				'1-0': 1,
				'1-1': 1,
			}),
			cover: createEmptyGrid({ width: 3, height: 3 }, 1),
		}

		expect(grids.cover).toStrictEqual([
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
		])

		const uncovered = handleClick(grids, { x: 1, y: 1 }, false)

		expect(uncovered.cover).toStrictEqual([
			[1, 1, 1],
			[1, 0, 1],
			[1, 1, 1],
		])

		const uncovered2 = handleClick(uncovered, { x: 1, y: 0 }, false)

		expect(uncovered2.cover).toStrictEqual([
			[1, 0, 1],
			[1, 0, 1],
			[1, 1, 1],
		])

		const uncovered3 = handleClick(uncovered2, { x: 0, y: 1 }, false)

		expect(uncovered3.cover).toStrictEqual([
			[1, 0, 1],
			[0, 0, 1],
			[1, 1, 1],
		])
	})

	it('uncovers the all empty fields + 1 surrounding an empty field', () => {
		const grids: GameGrids = {
			mine: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 1,
			}),
			flag: createEmptyGrid({ width: 3, height: 3 }),
			mineCount: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 9,
				'0-1': 1,
				'1-0': 1,
				'1-1': 1,
			}),
			cover: createEmptyGrid({ width: 3, height: 3 }, 1),
		}

		expect(grids.cover).toStrictEqual([
			[1, 1, 1],
			[1, 1, 1],
			[1, 1, 1],
		])

		const uncovered = handleClick(grids, { x: 2, y: 2 }, false)

		expect(uncovered.cover).toStrictEqual([
			[1, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		])
	})

	it('does not uncover the field when the field is flagged', () => {
		const grids: GameGrids = {
			mine: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 1,
			}),
			flag: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'1-1': 1
			}),
			mineCount: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 9,
				'0-1': 1,
				'1-0': 1,
				'1-1': 1,
			}),
			cover: createEmptyGrid({ width: 3, height: 3 }, 1),
		}

		expect(
			() => handleClick(grids, { x: 1, y: 1 }, false)
		).toThrow(FieldIsFlaggedField)

		const flagRemoved = handleClick(grids, { x: 1, y: 1 }, true)

		expect(
			() => handleClick(flagRemoved, { x: 1, y: 1 }, false)
		).not.toThrow(FieldIsFlaggedField)
	})

	it('does not uncover the field when the field is mined', () => {
		const grids: GameGrids = {
			mine: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 1,
			}),
			flag: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'1-1': 1
			}),
			mineCount: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 9,
				'0-1': 1,
				'1-0': 1,
				'1-1': 1,
			}),
			cover: createEmptyGrid({ width: 3, height: 3 }, 1),
		}

		expect(
			() => handleClick(grids, { x: 0, y: 0 }, false)
		).toThrow(FieldIsMineField)
	})

	it('uncovers all covered fields when the number of flags is correct', () => {
		const grids: GameGrids = {
			mine: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 1,
			}),
			flag: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 1,
			}),
			mineCount: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'1-1': 1,
			}),
			cover: insertValues(createEmptyGrid({ width: 3, height: 3 }, 1), {
				'1-1': 0,
			}),
		}

		const newGrids = handleClick(grids, { x: 1, y: 1 }, false)

		expect(newGrids.cover).toStrictEqual([
			[1, 0, 0],
			[0, 0, 0],
			[0, 0, 0],
		])
	})

	it('uncovers all covered fields when the number of flags is correct, but there is a mine', () => {
		const grids: GameGrids = {
			mine: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-0': 1,
			}),
			flag: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'0-2': 1,
			}),
			mineCount: insertValues(createEmptyGrid({ width: 3, height: 3 }), {
				'1-1': 1,
			}),
			cover: insertValues(createEmptyGrid({ width: 3, height: 3 }, 1), {
				'1-1': 0,
			}),
		}


		expect(
			() => handleClick(grids, { x: 1, y: 1 }, false)
		).toThrow(FieldIsMineField)
	})
})

describe('The game save feature', () => {
	describe('The toSaveState function', () => {
		it('returns a valid base64 string', () => {
			const grids = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

			const saveState = toSaveState(grids)

			expect(atob(saveState))
		})

		it('has 5 segments each separated by a dot (version, dimensions, mine, flags, cover)', () => {
			const grids = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

			const saveState = toSaveState(grids)

			expect(atob(saveState).split('.')).toHaveLength(5)
		})

		it('has the save version number as the first segment', () => {
			const grids = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

			const saveState = toSaveState(grids)

			expect(JSON.parse(atob(saveState).split('.').at(0) as string)).toBeTypeOf('number')
		})

		it('has the playfield dimensions as the second segment', () => {
			const grids5x5 = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })
			const grids7x3 = createGameGrids({ width: 7, height: 3 }, 12, { x: 1, y: 1 })

			const saveState5x5 = toSaveState(grids5x5)
			const saveState7x3 = toSaveState(grids7x3)

			expect(atob(saveState5x5).split('.').at(1)).toBe('5x5')
			expect(atob(saveState7x3).split('.').at(1)).toBe('7x3')
		})

		it('has the playfields as valid base64 strings for the remaining segments', () => {
			const grids = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

			const saveState = toSaveState(grids)
			const decodedAndSplitSaveState = atob(saveState).split('.')

			expect(atob(decodedAndSplitSaveState.at(2) as string)).toBeTypeOf('string')
			expect(atob(decodedAndSplitSaveState.at(3) as string)).toBeTypeOf('string')
			expect(atob(decodedAndSplitSaveState.at(4) as string)).toBeTypeOf('string')
		})

		it('saves the mine field correctly', () => {
			const grids = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

			const saveState = toSaveState(grids)
			const decodedAndSplitSaveState = atob(saveState).split('.')

			// The minefield must (according to the placing rules and the
			// playfield settings) be in the shape of:
			const expectedMineField = [
				[1, 1, 1, 1, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 0, 0, 0, 1],
				[1, 1, 1, 1, 1],
			]

			let mineField: string | Uint8Array = decodedAndSplitSaveState.at(2) as string

			// @ts-expect-error  the minefield is not regarded as array-like by
			//                   TS, even though the JS engine treats it as such.
			mineField = Uint8Array.from(atob(mineField), i => i.codePointAt(0))
			mineField = [...mineField].map(i => i.toString(2).padStart(8, '0')).join('')

			expect(mineField).toContain(expectedMineField.flat().join(''))
		})
	})

	describe('The fromSaveState function', () => {
		it('restores the grids from the save state', () => {
			const grids = createGameGrids({ width: 5, height: 5 }, 16, { x: 2, y: 2 })

			const saveState = toSaveState(grids)

			const restored = fromSaveState(saveState)

			expect(restored).toStrictEqual(grids)
		})
	})
})
