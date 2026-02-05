interface PreviewConfig {
	cols: number
	rows: number
	lockRatio: boolean
	circleRadius: number
	gap: number
	borderRadius: number // CSS px
}

interface PreviewProps {
	src: string
	config: PreviewConfig
}

// Checks if a rectangle fits fully inside a rounded rectangle
function isRectInsideRoundedRect(x: number, y: number, w: number, h: number, W: number, H: number, r: number) {
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

export function Preview({ src, config }: PreviewProps) {
	const { cols, rows, circleRadius, gap, borderRadius } = config

	const elementSize = 30
	const spacing = elementSize + gap

	const totalWidth = cols * elementSize + (cols - 1) * gap
	const totalHeight = rows * elementSize + (rows - 1) * gap

	// rendered size in px
	const RENDER_HEIGHT = 400
	const renderWidth = (totalWidth / totalHeight) * RENDER_HEIGHT

	// scale: viewBox → px
	const scaleX = renderWidth / totalWidth
	const scaleY = RENDER_HEIGHT / totalHeight

	// border radius in viewBox units
	const borderRadiusVB = Math.min(borderRadius / Math.min(scaleX, scaleY), Math.min(totalWidth, totalHeight) / 2)

	// compute visible cells
	const visibleCells: Array<{ row: number; col: number }> = []
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const x = col * spacing
			const y = row * spacing
			if (
				borderRadiusVB === 0 ||
				isRectInsideRoundedRect(x, y, elementSize, elementSize, totalWidth, totalHeight, borderRadiusVB)
			) {
				visibleCells.push({ row, col })
			}
		}
	}

	return (
		<div className="w-full overflow-hidden" style={{ borderRadius }}>
			<svg width="100%" viewBox={`0 0 ${totalWidth} ${totalHeight}`} preserveAspectRatio="xMidYMid meet">
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
