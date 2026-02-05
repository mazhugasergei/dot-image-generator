interface PreviewProps {
	src: string
	alt: string
	cols?: number
	rows?: number
	lockRatio?: boolean
	circleRadius?: number
	gap?: number
	borderRadius?: number
}

export function Preview({
	src,
	alt,
	cols = 10,
	rows = 10,
	lockRatio = true,
	circleRadius = 15,
	gap = 10,
	borderRadius = 0,
}: PreviewProps) {
	// Calculate actual rows if ratio is locked
	const actualRows = lockRatio ? cols : rows

	// Calculate spacing between circle centers
	const elementSize = 30 // Fixed rectangle size
	const spacing = elementSize + gap

	// Calculate total dimensions (don't add gap after last circle)
	const totalWidth = cols * elementSize + (cols - 1) * gap
	const totalHeight = actualRows * elementSize + (actualRows - 1) * gap

	return (
		<div
			className="overflow-hidden border"
			style={{
				borderRadius: `${borderRadius}px`,
				clipPath: borderRadius > 0 ? `inset(0 round ${borderRadius}px)` : "none",
			}}
		>
			<svg
				width="100%"
				height={lockRatio ? "400" : `${(actualRows / cols) * 400}`}
				viewBox={`0 0 ${totalWidth} ${totalHeight}`}
				className="w-full"
			>
				<defs>
					<mask id="circlesMask">
						<rect width={totalWidth} height={totalHeight} fill="black" />
						{Array.from({ length: actualRows }, (_, row) =>
							Array.from({ length: cols }, (_, col) => (
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
							))
						)}
					</mask>
				</defs>
				<image
					href={src}
					width={totalWidth}
					height={totalHeight}
					preserveAspectRatio="xMidYMid slice"
					mask="url(#circlesMask)"
				/>
			</svg>
		</div>
	)
}
