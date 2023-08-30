import React from 'react'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import VisuallyHidden from '../VisuallyHidden'
import FocusTrap from '../FocusTrap'

import styles from './Modal.module.css'

export default function Modal(
	{
		children = null,
		isOpen,
		dismiss,
		title = '',
		footer = null,
	}: React.PropsWithChildren<{
		isOpen: boolean
		title: string
		footer?: React.ReactNode
		dismiss: () => void
	}>)
{
	const modalHeader = React.useRef<HTMLDivElement>(null)
	const modal = React.useRef<HTMLDivElement>(null)

	const close = React.useCallback(
		function close(e?: React.MouseEvent) {
			e?.stopPropagation()

			dismiss()
		},
		[dismiss]
	)

	React.useEffect(() => {
		if (!isOpen) {
			return
		}

		const oldValue = document.body.style.overflow

		document.body.style.overflow = 'hidden'

		return () => {(document.body.style.overflow = oldValue)}
	}, [isOpen])

	React.useEffect(() => {
		if (!isOpen) {
			return
		}

		function handleKeyup(e: KeyboardEvent) {
			if (e.code === 'Escape') {
				close()
			}
		}

		window.addEventListener('keyup', handleKeyup)

		return () => window.removeEventListener('keyup', handleKeyup)
	}, [isOpen, close])

	const id = React.useId()

	React.useEffect(() => {
		if (!isOpen) {
			return
		}

		const modalHeaderElement = modalHeader.current as HTMLDivElement
		const modalElement = modal.current as HTMLDivElement
		let modalElementRect = modalElement.getBoundingClientRect()

		function updateModalPosition({ x, y }: { x: number, y: number }) {
			x = Math.max(0, Math.min(x, window.innerWidth - modalElementRect.width))
			y = Math.max(0, Math.min(y, window.innerHeight - modalElementRect.height))

			modalElement.style.position = 'absolute'
			modalElement.style.left = `${x}px`
			modalElement.style.top = `${y}px`
		}

		updateModalPosition({
			x: (window.innerWidth - modalElementRect.width) / 2,
			y: (window.innerHeight - modalElementRect.height) / 2,
		})

		function handleMouseDown(mouseDownEvent: MouseEvent) {
			modalElementRect = modalElement.getBoundingClientRect()

			const startMouseCoordinates = { x: mouseDownEvent.clientX, y: mouseDownEvent.clientY }

			function handleMouseMove(mouseMoveEvent: MouseEvent) {
				mouseDownEvent.preventDefault()
				mouseMoveEvent.preventDefault()

				const xDiff = startMouseCoordinates.x - mouseMoveEvent.clientX
				const yDiff = startMouseCoordinates.y - mouseMoveEvent.clientY

				updateModalPosition({
					x: modalElementRect.x - xDiff,
					y: modalElementRect.y - yDiff,
				})
			}

			function handleMouseUp() {
				document.removeEventListener('mouseup', handleMouseUp)
				document.removeEventListener('mousemove', handleMouseMove)
			}

			document.addEventListener('mouseup', handleMouseUp)
			document.addEventListener('mousemove', handleMouseMove)
		}

		modalHeaderElement.addEventListener('mousedown', handleMouseDown)

		return () => modalHeaderElement.removeEventListener('mousedown', handleMouseDown)
	}, [isOpen])

	if (!isOpen) {
		return
	}

	const modalJsx = (
		<div className={styles['modal-container']}>
			<div
				className={styles.backdrop}
				onClick={close}
			/>

			<div
				className={styles.modal}
				role="dialog"
				aria-labelledby={`modal-title-${id}`}
				aria-modal="true"
				ref={modal}
			>
				<FocusTrap allowForProgramaticTab={true}>
					<div className={styles['modal-header']} ref={modalHeader}>
						<span id={`modal-title-${id}`}>
							{title}
						</span>

						<button onClick={close}>
							<FontAwesomeIcon icon={faTimes} />

							<VisuallyHidden>
								Close
							</VisuallyHidden>
						</button>
					</div>

					{children && <div className={styles['modal-content']}>
						{children}
					</div>}

					{footer && <div className={styles['modal-footer']}>
						{footer}
					</div>}
				</FocusTrap>
			</div>
		</div>
	)

	return ReactDOM.createPortal(
		modalJsx,
		document.getElementById('modals') as HTMLDivElement
	)
}
