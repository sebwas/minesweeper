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
	const scrollTop = React.useRef(0)
	const [showLeftShadow, setShowLeftShadow] = React.useState(false)
	const [showRightShadow, setShowRightShadow] = React.useState(false)
	const [showTopShadow, setShowTopShadow] = React.useState(false)
	const [showBottomShadow, setShowBottomShadow] = React.useState(false)
	const innerContainer = React.useRef<HTMLDivElement>(null)
	const outerContainer = React.useRef<HTMLDivElement>(null)

	React.useEffect(() => {
		if (!innerContainer.current) {
			return
		}

		const containerElement = innerContainer.current as HTMLDivElement

		function updateScrollPosition() {
			scrollLeft.current = containerElement.scrollLeft
			scrollTop.current = containerElement.scrollTop
		}

		containerElement.addEventListener('scroll', updateScrollPosition)
		window.addEventListener('resize', updateScrollPosition)

		return function unregisterActions() {
			containerElement.removeEventListener('scroll', updateScrollPosition)
			window.removeEventListener('resize', updateScrollPosition)
		}
	}, [])

	React.useEffect(() => {
		if (!element?.current) {
			return
		}

		const innerElement = element.current as HTMLElement
		const parentElement = innerContainer.current as HTMLDivElement
		const outerElement = outerContainer.current as HTMLDivElement

		function updateScrollPosition() {
			const innerWidth = innerElement.scrollWidth
			const outerWidth = outerElement.getBoundingClientRect().width

			setShowLeftShadow(parentElement.scrollLeft > margin)
			setShowRightShadow((parentElement.scrollLeft + outerWidth) < (innerWidth - margin))

			const innerHeight = innerElement.scrollHeight
			const outerHeight = outerElement.getBoundingClientRect().height

			setShowTopShadow(parentElement.scrollTop > margin)
			setShowBottomShadow((parentElement.scrollTop + outerHeight) < (innerHeight - margin))
		}

		parentElement?.addEventListener('scroll', updateScrollPosition)
		window.addEventListener('resize', updateScrollPosition)

		updateScrollPosition()

		const observer = new MutationObserver(updateScrollPosition)

		observer.observe(innerElement, { childList: true })

		return function unregisterActions() {
			parentElement?.removeEventListener('scroll', updateScrollPosition)
			window.removeEventListener('resize', updateScrollPosition)
			observer.disconnect()
		}
	}, [element, margin])

	return (
		<div
			className={`${styles['outer-container']} ${className}`}
			ref={outerContainer}
		>
			<div
				className={styles['inner-container']}
				{...delegated}
				ref={innerContainer}
			>
				{children}
			</div>

			<InnerShadow side="left" show={showLeftShadow} />
			<InnerShadow side="right" show={showRightShadow} />
			<InnerShadow side="top" show={showTopShadow} />
			<InnerShadow side="bottom" show={showBottomShadow} />
		</div>
	)
}

function InnerShadow({ side, show }: { side: 'left' | 'right' | 'top' | 'bottom', show: boolean }) {
	return (
		<div className={`${styles['inner-shadow']} ${styles[side]} ${styles[`show-${Number(show)}`]}`} />
	)
}
