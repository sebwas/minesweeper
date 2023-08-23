import React from 'react'

import styles from './VisuallyHidden.module.css'

export default function VisuallyHidden(
	{
		as: Elem = 'div',
		children,
		className = '',
		...delegated
	}: React.PropsWithChildren<{
		as?: string,
		className?: string
	}>
) {
	return (
		// @ts-expect-error It does not like the generic element.
		<Elem
			{...delegated}
			className={`${className} ${styles['visually-hidden']}`}
		>
			{children}
		</Elem>
	)
}