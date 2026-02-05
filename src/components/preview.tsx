interface PreviewProps {
	src: string
	alt: string
	cols?: number
	rows?: number
	lockRatio?: boolean
	circleRadius?: number
	gap?: number
}

export function Preview({
	src,
	alt,
	cols = 10,
	rows = 10,
	lockRatio = true,
	circleRadius = 15,
	gap = 10,
}: PreviewProps) {
	// Calculate actual rows if ratio is locked
	const actualRows = lockRatio ? cols : rows

	// Calculate spacing between circle centers
	const spacing = circleRadius * 2 + gap

	// Calculate total dimensions (don't add gap after last circle)
	const totalWidth = cols * circleRadius * 2 + (cols - 1) * gap
	const totalHeight = actualRows * circleRadius * 2 + (actualRows - 1) * gap

	return (
		<div className="w-full border">
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
								<circle
									key={`${row}-${col}`}
									cx={col * spacing + circleRadius}
									cy={row * spacing + circleRadius}
									r={circleRadius}
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
