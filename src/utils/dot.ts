export function isRectInsideRoundedRect(x: number, y: number, w: number, h: number, W: number, H: number, r: number) {
	r = Math.min(r, W / 2, H / 2)

	const corners = [
		{ x, y },
		{ x: x + w, y },
		{ x, y: y + h },
		{ x: x + w, y: y + h },
	]

	return corners.every(({ x, y }) => {
		// inside straight edges
		if (x >= r && x <= W - r) return true
		if (y >= r && y <= H - r) return true

		// inside corner circles
		const cx = x < r ? r : W - r
		const cy = y < r ? r : H - r
		const dx = x - cx
		const dy = y - cy

		return dx * dx + dy * dy <= r * r
	})
}
