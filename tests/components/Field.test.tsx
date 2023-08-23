import { afterEach, describe, expect, it, test } from 'vitest'

import Field from '../../src/components/GameGrid/Field'
import { act, cleanup, fireEvent, getGameControl, render, userEvent } from '../utils/render'
import { GameStatus } from '../../src/components/GameProvider'

afterEach(() => cleanup())

describe('The <Field /> component', () => {
	describe('on click', () => {
		it('uncovers a number field', () => {
			const gameControl = getGameControl()

			const { getByText } = render(<Field x={1} y={1} />)

			act(() => {
				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setStatus(GameStatus.running)

				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setGrids({
					mine: [
						[1, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					flag: [
						[0, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					mineCount: [
						[9, 1, 0],
						[1, 1, 0],
						[0, 0, 0],
					],

					cover: [
						[1, 1, 1],
						[1, 1, 1],
						[1, 1, 1],
					],
				})
			})

			expect(getByText('covered')).toBeTruthy()

			fireEvent.click(getByText('covered'))

			expect(getByText('1')).toBeTruthy()

			expect(gameControl.control.cover).toStrictEqual([
				[1, 1, 1],
				[1, 0, 1],
				[1, 1, 1],
			])
		})

		it('uncovers a non-number field and all surrounding ones', () => {
			const gameControl = getGameControl()

			const { getByText } = render(<Field x={2} y={1} />)

			act(() => {
				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setStatus(GameStatus.running)

				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setGrids({
					mine: [
						[1, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					flag: [
						[0, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					mineCount: [
						[9, 1, 0],
						[1, 1, 0],
						[0, 0, 0],
					],

					cover: [
						[1, 1, 1],
						[1, 0, 1],
						[1, 1, 1],
					],
				})
			})

			expect(getByText('covered')).toBeTruthy()

			fireEvent.click(getByText('covered'))

			expect(gameControl.control.cover).toStrictEqual([
				[1, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			])
		})

		test('on an uncovered field does nothing', () => {
			const gameControl = getGameControl()

			const { getByText } = render(<Field x={1} y={1} />)

			act(() => {
				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setStatus(GameStatus.running)

				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setGrids({
					mine: [
						[1, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					flag: [
						[0, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					mineCount: [
						[9, 1, 0],
						[1, 1, 0],
						[0, 0, 0],
					],

					cover: [
						[1, 1, 1],
						[1, 0, 1],
						[1, 1, 1],
					],
				})
			})

			expect(getByText('1')).toBeTruthy()

			fireEvent.click(getByText('1'))

			expect(gameControl.control.mine).toStrictEqual([
				[1, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			])

			expect(gameControl.control.flag).toStrictEqual([
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			])

			expect(gameControl.control.mineCount).toStrictEqual([
				[9, 1, 0],
				[1, 1, 0],
				[0, 0, 0],
			])

			expect(gameControl.control.cover).toStrictEqual([
				[1, 1, 1],
				[1, 0, 1],
				[1, 1, 1],
			])
		})

		test('with the right mouse button toggles the flag', async () => {
			const gameControl = getGameControl()

			const { getByText } = render(<Field x={0} y={0} />)

			act(() => {
				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setStatus(GameStatus.running)

				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setGrids({
					mine: [
						[1, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					flag: [
						[0, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					mineCount: [
						[9, 1, 0],
						[1, 1, 0],
						[0, 0, 0],
					],

					cover: [
						[1, 1, 1],
						[1, 0, 1],
						[1, 1, 1],
					],
				})
			})

			expect(getByText('covered')).toBeTruthy()

			await userEvent.pointer([{target: getByText('covered')}, {keys: '[MouseRight]', target: getByText('covered')}])

			expect(gameControl.control.flag).toStrictEqual([
				[1, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			])

			expect(getByText('flagged')).toBeTruthy()

			await userEvent.pointer([{target: getByText('flagged')}, {keys: '[MouseRight]', target: getByText('flagged')}])

			expect(gameControl.control.flag).toStrictEqual([
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			])
		})

		test('with the right mouse button does nothing if the field is uncovered', async () => {
			const gameControl = getGameControl()

			const { getByText } = render(<Field x={1} y={1} />)

			act(() => {
				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setStatus(GameStatus.running)

				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setGrids({
					mine: [
						[1, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					flag: [
						[0, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					mineCount: [
						[9, 1, 0],
						[1, 1, 0],
						[0, 0, 0],
					],

					cover: [
						[1, 1, 1],
						[1, 0, 1],
						[1, 1, 1],
					],
				})
			})

			expect(getByText('1')).toBeTruthy()

			await userEvent.pointer([{target: getByText('1')}, {keys: '[MouseRight]', target: getByText('1')}])

			expect(gameControl.control.flag).toStrictEqual([
				[0, 0, 0],
				[0, 0, 0],
				[0, 0, 0],
			])
		})

		test('on a mine the game changes the status to lost', async () => {
			const gameControl = getGameControl()

			const { getByText } = render(<Field x={0} y={0} />)

			act(() => {
				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setStatus(GameStatus.running)

				// @ts-expect-error This is an API only available during tests.
				gameControl.control.setGrids({
					mine: [
						[1, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					flag: [
						[0, 0, 0],
						[0, 0, 0],
						[0, 0, 0],
					],

					mineCount: [
						[9, 1, 0],
						[1, 1, 0],
						[0, 0, 0],
					],

					cover: [
						[1, 1, 1],
						[1, 1, 1],
						[1, 1, 1],
					],
				})
			})

			expect(getByText('covered')).toBeTruthy()

			await userEvent.pointer([{ target: getByText('covered') }, {target: getByText('covered'), keys: '[MouseLeft]'}])

			expect(gameControl.control.status).toBe(GameStatus.lose)
		})
	})
})
