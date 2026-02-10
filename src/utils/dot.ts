interface Props {
	dotPositionX: number
	dotPositionY: number
	dotWidth: number
	dotHeight: number
	containerWidth: number
	containerHeight: number
	containerBorderRadius: number
}

export function isRectInsideRoundedRect(props: Props) {
	const maxPossibleRadius = Math.min(props.containerWidth, props.containerHeight) / 2
	const effectiveRadius = Math.min(props.containerBorderRadius, maxPossibleRadius)

	const corners = [
		{ x: props.dotPositionX, y: props.dotPositionY },
		{ x: props.dotPositionX + props.dotWidth, y: props.dotPositionY },
		{ x: props.dotPositionX, y: props.dotPositionY + props.dotHeight },
		{ x: props.dotPositionX + props.dotWidth, y: props.dotPositionY + props.dotHeight },
	]

	return corners.every(({ x, y }) => {
		// If no border radius, everything is inside
		if (effectiveRadius === 0) return true

		// Check if corner is in the straight edge areas
		const inHorizontalStraightArea = x >= effectiveRadius && x <= props.containerWidth - effectiveRadius
		const inVerticalStraightArea = y >= effectiveRadius && y <= props.containerHeight - effectiveRadius

		if (inHorizontalStraightArea || inVerticalStraightArea) return true

		// Check if corner is inside the rounded corner areas
		// Determine which corner we're checking
		let centerX: number, centerY: number

		if (x < effectiveRadius && y < effectiveRadius) {
			// Top-left corner
			centerX = effectiveRadius
			centerY = effectiveRadius
		} else if (x >= props.containerWidth - effectiveRadius && y < effectiveRadius) {
			// Top-right corner
			centerX = props.containerWidth - effectiveRadius
			centerY = effectiveRadius
		} else if (x < effectiveRadius && y >= props.containerHeight - effectiveRadius) {
			// Bottom-left corner
			centerX = effectiveRadius
			centerY = props.containerHeight - effectiveRadius
		} else {
			// Bottom-right corner
			centerX = props.containerWidth - effectiveRadius
			centerY = props.containerHeight - effectiveRadius
		}

		// Check if the corner point is within the quarter-circle
		const dx = x - centerX
		const dy = y - centerY
		const distanceSquared = dx * dx + dy * dy

		return distanceSquared <= effectiveRadius * effectiveRadius
	})
}
