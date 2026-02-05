interface PreviewProps {
	src: string
	cols?: number
	rows?: number
	lockRatio?: boolean
	circleRadius?: number
	gap?: number
	borderRadius?: number
}

function isRectInsideRoundedRect(x: number, y: number, w: number, h: number, W: number, H: number, r: number) {
	r = Math.min(r, W / 2, H / 2)

	const corners = [
		{ x, y },
		{ x: x + w, y },
		{ x, y: y + h },
		{ x: x + w, y: y + h },
	]

	return corners.every(({ x, y }) => {
		// straight edges
		if (x >= r && x <= W - r) return true
		if (y >= r && y <= H - r) return true

		// corner circles
		const cx = x < r ? r : W - r
		const cy = y < r ? r : H - r

		const dx = x - cx
		const dy = y - cy

		return dx * dx + dy * dy <= r * r
	})
}

export function Preview({
	src,
	cols = 10,
	rows = 10,
	lockRatio = true,
	circleRadius = 15,
	gap = 10,
	borderRadius = 0,
}: PreviewProps) {
	const actualRows = lockRatio ? cols : rows

	const elementSize = 30
	const spacing = elementSize + gap

	const totalWidth = cols * elementSize + (cols - 1) * gap
	const totalHeight = actualRows * elementSize + (actualRows - 1) * gap

	const visibleCells: Array<{ row: number; col: number }> = []

	for (let row = 0; row < actualRows; row++) {
		for (let col = 0; col < cols; col++) {
			const x = col * spacing
			const y = row * spacing

			if (
				borderRadius === 0 ||
				isRectInsideRoundedRect(x, y, elementSize, elementSize, totalWidth, totalHeight, borderRadius)
			) {
				visibleCells.push({ row, col })
			}
		}
	}

	return (
		<div
			className="overflow-hidden border"
			style={{
				borderRadius,
			}}
		>
			<svg
				width="100%"
				height={lockRatio ? 400 : (actualRows / cols) * 400}
				viewBox={`0 0 ${totalWidth} ${totalHeight}`}
			>
				<defs>
					<mask id="gridMask">
						<rect width={totalWidth} height={totalHeight} fill="black" />
						{visibleCells.map(({ row, col }) => (
							<rect
								key={`${row}-${col}`}
								x={col * spacing}
								y={row * spacing}
								width={elementSize}
								height={elementSize}
								rx={circleRadius}
								ry={circleRadius}
								fill="white"
							/>
						))}
					</mask>
				</defs>

				<image
					href={src}
					width={totalWidth}
					height={totalHeight}
					preserveAspectRatio="xMidYMid slice"
					mask="url(#gridMask)"
				/>
			</svg>
		</div>
	)
}
