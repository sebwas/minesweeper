import GameError from "./errors";
import { between, limit, min0 } from "./numbers"

type GameGrids = {
    mine: MineGrid<0 | 1>;
    cover: MineGrid<0 | 1>;
    flag: MineGrid<0 | 1>;
    mineCount: MineGrid<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>;
}

export function createEmptyGrid<T extends number>(dimensions: GridDimensions, initialValue = 0): MineGrid<T> {
	return new Array(dimensions.height)
		.fill(null)
		.map(
			() => new Array(dimensions.width).fill(initialValue)
		)
}

/**
 * CAUTION: IMPURE.
 * Impure function to update the count of surrounding mines around the coordinates.
 */
function updateSurroundingMineCounts(
	grid: GameGrids['mineCount'],
	coordinates: Coordinates
) {
	const [height, width] = [grid.length, grid[0]?.length || 0]

	const [fromX, toX] = [min0(coordinates.x - 1), limit(coordinates.x + 1, width - 1)]
	const [fromY, toY] = [min0(coordinates.y - 1), limit(coordinates.y + 1, height - 1)]

	for (let y = fromY; y <= toY; y++) {
		for (let x = fromX; x <= toX; x++) {
			// We skip the mine field.
			if (x === coordinates.x && y === coordinates.y) {
				continue
			}

			grid[y][x] = Math.min(9, grid[y][x] + 1) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
		}
	}
}

function isInSparePerimeter(
	dimensions: GridDimensions,
	{x, y}: Coordinates,
	spareField: Coordinates,
	sparePerimeter: number
) {
	return between(
		y,
		min0(spareField.y - sparePerimeter),
		limit(spareField.y + sparePerimeter, dimensions.height)
	) && between(
		x,
		min0(spareField.x - sparePerimeter),
		limit(spareField.x + sparePerimeter, dimensions.width)
	)
}

function coordinateIsValid(coordinates: Coordinates, dimensions: GridDimensions) {
	return coordinates.x >= 0
		&& coordinates.y >= 0
		&& coordinates.x < dimensions.width
		&& coordinates.y < dimensions.height
}

function getSparePerimeterCoordinates(spareField: Coordinates, sparePerimeter: number, dimensions: GridDimensions) {
	const coordinates = []

	for (let x = spareField.x - sparePerimeter; x <= spareField.x + sparePerimeter; x++) {
		for (let y = spareField.y - sparePerimeter; y <= spareField.y + sparePerimeter; y++) {
			const field: Coordinates = { x, y }

			if (coordinateIsValid(field, dimensions)) {
				coordinates.push(field)
			}
		}
	}

	return coordinates
}

function mineCountTooHigh(
	dimensions: GridDimensions,
	numberOfMines: number,
	spareField: Coordinates,
	sparePerimeter: number
) {
	const fieldCount = dimensions.width * dimensions.height

	if (numberOfMines > (fieldCount - 1)) {
		return true
	}

	const spareFields = getSparePerimeterCoordinates(spareField, sparePerimeter, dimensions)

	return numberOfMines > (fieldCount - spareFields.length)
}

export function createGameGrids(
	dimensions: GridDimensions,
	numberOfMines: number,
	spareField: Coordinates,
	sparePerimeter = 1
) {
	if (mineCountTooHigh(dimensions, numberOfMines, spareField, sparePerimeter)) {
		throw GameError.mineCountTooHigh()
	}

	// Create the 4 different grid layers.
	const mineGrid = createEmptyGrid<0|1>(dimensions)
	const coverGrid = createEmptyGrid<0|1>(dimensions, 1)
	const flagGrid = createEmptyGrid<0|1>(dimensions)

	// 9 is a special value used for mine fields.
	const mineCountGrid = createEmptyGrid<0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9>(dimensions)

	const chanceOfPlacing = numberOfMines / (dimensions.width * dimensions.height)

	let minesLeftToPlace = numberOfMines

	// eslint-disable-next-line no-constant-condition
	outer: while (true) {
		for (let x = 0; x < dimensions.width; x++) {
			for (let y = 0; y < dimensions.height; y++) {
				// Skip if field already has a mine.
				if (mineGrid[y][x]) {
					continue
				}

				// Define perimeter around initial field to not contain any mines.
				if (isInSparePerimeter(dimensions, {x, y}, spareField, sparePerimeter)) {
					continue
				}

				const randomValue = Math.random()

				if (randomValue <= chanceOfPlacing) {
					mineGrid[y][x] = 1
					mineCountGrid[y][x] = 9
					updateSurroundingMineCounts(mineCountGrid, {x, y})
					minesLeftToPlace--
				}

				if (minesLeftToPlace === 0) {
					break outer
				}
			}
		}
	}

	return {
		mine: mineGrid,
		cover: coverGrid,
		flag: flagGrid,
		mineCount: mineCountGrid
	} as GameGrids
}

function getListOfFieldsToUncover(
	mineCountGrid: MineGrid,
	field: Coordinates,
	toBeUncovered: Set<string> = new Set<string>([`${field.x}-${field.y}`])
) {
	const fieldsToTry = [
		{ ...field, x: field.x - 1 },
		{ ...field, x: field.x + 1 },
		{ ...field, y: field.y - 1 },
		{ ...field, y: field.y + 1 },
		{ x: field.x - 1, y: field.y - 1 },
		{ x: field.x + 1, y: field.y - 1 },
		{ x: field.x - 1, y: field.y + 1 },
		{ x: field.x + 1, y: field.y + 1 },
	]

	fieldsToTry.forEach(field => {
		if (
			field.x < 0
			|| field.y < 0
			|| field.x >= mineCountGrid[0].length
			|| field.y >= mineCountGrid.length
		) {
			return
		}

		if (toBeUncovered.has(`${field.x}-${field.y}`)) {
			return
		}

		toBeUncovered.add(`${field.x}-${field.y}`)

		if (mineCountGrid[field.y][field.x] === 0) {
			getListOfFieldsToUncover(mineCountGrid, field, toBeUncovered).forEach(
				field => toBeUncovered.add(field)
			)
		}
	})

	return toBeUncovered
}

/**
 * Provides a simple check if the provided game grids are valid. Simple, in this
 * case, means that we are not checking for internal logic, e.g. if the
 * mineCount matches the actual number of surrounding mines. Instead we only
 * make sure that the data is valid (i.e. the dimensions match and the numbers
 * are in the expected ranges.)
 */
function gridsAreValid(grids: GameGrids) {
	const layers = Object.keys(grids)

	if (
		layers.length !== 4
		|| !layers.includes('mine')
		|| !layers.includes('cover')
		|| !layers.includes('flag')
		|| !layers.includes('mineCount')
	) {
		return GameError.gridsAreMissing()
	}

	const dimensions: GridDimensions = { width: grids.mine[0]?.length || 0, height: grids.mine.length }

	if (
		!(dimensions.width && dimensions.height)
		|| !(grids.cover.length === dimensions.height && (grids.cover[0]?.length || 0) === dimensions.width)
		|| !(grids.mineCount.length === dimensions.height && (grids.mineCount[0]?.length || 0) === dimensions.width)
		|| !(grids.flag.length === dimensions.height && (grids.flag[0]?.length || 0) === dimensions.width)
	) {
		return GameError.dimensionMismatch()
	}

	const Set01 = new Set([0, 1])
	const Set0To9 = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

	// Flag grid contains invalid elements.
	if (grids.flag.flat().find(f => !Set01.has(f))) {
		return GameError.flagGridHasUnexpectedValues()
	}

	// Mine grid contains invalid elements.
	if (grids.mine.flat().find(f => !Set01.has(f))) {
		return GameError.mineGridHasUnexpectedValues()
	}

	// Mine count grid contains invalid elements.
	if (grids.mineCount.flat().find(f => !Set0To9.has(f))) {
		return GameError.mineCountGridHasUnexpectedValues()
	}

	// Cover grid contains invalid elements.
	if (grids.cover.flat().find(f => !Set01.has(f))) {
		return GameError.coverGridHasUnexpectedValues()
	}

	return null
}

function copyGrid<T extends number>(grid: MineGrid<T>) {
	return JSON.parse(JSON.stringify(grid)) as typeof grid
}

/**
 * Pure function to expand a selection of fields around an empty field (a field that has no neighboring mines.)
 */
function expandFieldsToUncover(grids: GameGrids, initial: Coordinates) {
	const { cover: coverGrid, mineCount } = grids

	const fields = getListOfFieldsToUncover(mineCount, initial)

	const cover = copyGrid(coverGrid)

	fields.forEach(coordinates => {
		const [x, y] = coordinates.split('-').map(i => parseInt(i, 10))

		cover[y][x] = 0
	})

	return cover
}

/**
 * Pure function to recalculate the grids after a click at the given coordinates.
 */
export function handleClick(grids: GameGrids, click: Coordinates, isRightClick: boolean, skipValidityCheck = false) {
	if (!skipValidityCheck) {
		const error = gridsAreValid(grids)

		if (error) {
			throw error
		}
	}

	const { x, y } = click

	const newGrids = {
		mine: copyGrid(grids.mine),
		mineCount: copyGrid(grids.mineCount),
		flag: copyGrid(grids.flag),
		cover: copyGrid(grids.cover),
	} as GameGrids

	if (isRightClick) {
		newGrids.flag[y][x] = Number(!newGrids.flag[y][x]) as 0 | 1

	// It's a flagged field, so we want to bail.
	// The click shouldn't get through, so this is only a failsafe.
	} else if (newGrids.flag[y][x]) {
		// It's a flag field.
	} else if (newGrids.mine[y][x]) {
		// We exploded.
	} else if (newGrids.mineCount[y][x] === 0) {
		newGrids.cover = expandFieldsToUncover(newGrids, { x, y })
	} else {
		newGrids.cover[y][x] = 0
	}

	return newGrids
}
