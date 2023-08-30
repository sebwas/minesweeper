import React from 'react'

function getFocusableElement(
	container: HTMLElement,
	which: 'first' | 'last',
	denyList: Element[],
	allowProgrammatic = false
) {
	const programmatic = allowProgrammatic ? '' : ':not([tabindex="-1"])'

	const focussable = [
		...container.querySelectorAll(
			`a[href], button, input, textarea, select, details, [tabindex]${programmatic}`
		)
	]

	const predicate = (el: Element) => !el.hasAttribute('disabled')
		&& !el.getAttribute('aria-hidden')
		&& !denyList.includes(el)

	if (which === 'last') {
		return focussable.findLast(predicate) as HTMLElement
	}

	return focussable.find(predicate) as HTMLElement
}

export default function FocusTrap (
	{
		children,
		as: ContainerElement = 'div',
		className = '',
		allowForProgramaticTab = false,
		...delegated
	}: React.PropsWithChildren<{
		as?: React.ElementType
		className?: string
		allowForProgramaticTab?: boolean
	}>
) {
	const container = React.useRef<HTMLDivElement>(null)
	const entrySentry = React.useRef<HTMLDivElement>(null)
	const exitSentry = React.useRef<HTMLDivElement>(null)

	const focus = React.useCallback(
		function focus(which: 'first' | 'last') {
			const element = getFocusableElement(
				container.current as HTMLElement,
				which,
				[
					entrySentry.current as HTMLDivElement,
					exitSentry.current as HTMLDivElement
				],
				allowForProgramaticTab
			);

			element?.focus()

			return element
		},
		[allowForProgramaticTab]
	)

	const focusFirst = React.useCallback(
		function focusFirst() {
			focus('first')
		},
		[focus]
	)

	const focusLast = React.useCallback(
		function focusLast() {
			focus('last')
		},
		[focus]
	)

	React.useEffect(() => {
		const activeElement = document.activeElement

		focusFirst()

		// @ts-expect-error TS doesn't know that it was focussed before.
		return () => activeElement?.focus()
	}, [focusFirst])

	React.useEffect(() => {
		const entryElement = entrySentry.current
		const exitElement = exitSentry.current

		;(function registerEventListeners() {
			entryElement?.addEventListener('focus', focusLast)
			exitElement?.addEventListener('focus', focusFirst)
		})()

		return function unregisterEventListeners() {
			entryElement?.addEventListener('focus', focusLast)
			exitElement?.addEventListener('focus', focusFirst)
		}
	}, [focusFirst, focusLast])

	return (<ContainerElement className={className} {...delegated} ref={container}>
		<div ref={entrySentry} tabIndex={0} data-entry />

		{children}

		<div ref={exitSentry} tabIndex={0} data-exit />
	</ContainerElement>)
}
