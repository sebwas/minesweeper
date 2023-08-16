export function between(value: number, min: number, max: number, inclusive = true) {
	if (!inclusive) {
		return value > min && value < max
	}

	return value >= min && value <= max
}

export function min0(value: number) {
	return Math.max(0, value)
}

export function max(value: number, lessThan: number) {
	return Math.min(lessThan, value)
}
