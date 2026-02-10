export function isRectInsideRoundedRect(
	dotPositionX: number,
	dotPositionY: number,
	dotWidth: number,
	dotHeight: number,
	containerWidth: number,
	containerHeight: number,
	containerBorderRadius: number
) {
	const corners = [
		{ x: dotPositionX, y: dotPositionY },
		{ x: dotPositionX + dotWidth, y: dotPositionY },
		{ x: dotPositionX, y: dotPositionY + dotHeight },
		{ x: dotPositionX + dotWidth, y: dotPositionY + dotHeight },
	]

	return corners.every(({ x, y }) => {
		// inside straight edges
		if (x >= containerBorderRadius && x <= containerWidth - containerBorderRadius) return true
		if (y >= containerBorderRadius && y <= containerHeight - containerBorderRadius) return true

		// inside corner circles
		const cx = x < containerBorderRadius ? containerBorderRadius : containerWidth - containerBorderRadius
		const cy = y < containerBorderRadius ? containerBorderRadius : containerHeight - containerBorderRadius
		const dx = x - cx
		const dy = y - cy

		return dx * dx + dy * dy <= containerBorderRadius * containerBorderRadius
	})
}
