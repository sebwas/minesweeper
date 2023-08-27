export function reduceToSum(a: number[]) {
	return a.reduce((a, b) => typeof b === 'number' ? a + b : a, 0)
}

export function chunkArray<T>(a: T[], chunkSize: number) {
	if (chunkSize <= 0) {
		throw new Error('Chunk size invalid: must be larger than 0.')
	}

	const chunked = []

	a = [...a]

	while (a.length) {
		chunked.push([...a.splice(0, chunkSize)])
	}

	return chunked
}
