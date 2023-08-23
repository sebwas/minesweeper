import React from 'react'
import styles from './scroll-shadow.module.css'

export default function ScrollShadow(
	{
		children,
		element,
		className = '',
		margin = 0,
		...delegated
	}: React.PropsWithChildren<{
		element: React.RefObject<HTMLElement>
		margin?: number
		className?: string
	}>
) {
	const scrollLeft = React.useRef(0)
	const [showLeftShadow, setShowLeftShadow] = React.useState(false)
	const [showRightShadow, setShowRightShadow] = React.useState(false)
	const container = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		if (!container.current) {
			return
		}

		const containerElement = container.current as HTMLDivElement

		function updateScrollLeft() {
			scrollLeft.current = containerElement.scrollLeft
		}

		containerElement.addEventListener('scroll', updateScrollLeft)

		return () => containerElement.removeEventListener('scroll', updateScrollLeft)
	}, [])

	React.useEffect(() => {
		if (!container.current) {
			return
		}

		const containerElement = container.current as HTMLDivElement

		containerElement.scrollLeft = scrollLeft.current
	}, [])

	React.useEffect(() => {
		if (!element?.current) {
			return
		}

		const innerElement = element.current as HTMLElement
		const parentElement = container.current as HTMLDivElement

		function updateScrollLeft() {
			const innerWidth = innerElement.scrollWidth
			const outerWidth = innerElement.getBoundingClientRect().width

			setShowLeftShadow(parentElement.scrollLeft > margin)
			setShowRightShadow((parentElement.scrollLeft + outerWidth) < (innerWidth - margin))
		}

		parentElement?.addEventListener('scroll', updateScrollLeft)

		updateScrollLeft()

		return () => parentElement?.removeEventListener('scroll', updateScrollLeft)
	}, [element, margin])

	return (
		<div style={{ position: 'relative' }}>
			<div
				{...delegated}
				ref={container}
				className={`${styles['outer-container']} ${className}`}
			>
				{children}
			</div>

			<InnerShadow side="left" show={showLeftShadow} />
			<InnerShadow side="right" show={showRightShadow} />
		</div>
	)
}

function InnerShadow({ side, show }: { side: 'left' | 'right', show: boolean }) {
	return (
		<div className={`${styles['inner-shadow']} ${styles[side]} ${styles[`show-${Number(show)}`]}`} />
	)
}
