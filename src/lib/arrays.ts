export function reduceToSum(a: number[]) {
	return a.reduce((a, b) => typeof b === 'number' ? a + b : a, 0)
}