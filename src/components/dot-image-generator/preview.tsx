import React from "react"

interface PreviewConfig {
	cols: number
	rows: number
	lockRatio: boolean
	circleRadius: number
	gap: number
	borderRadius: number // css px
	brightness: number
	saturation: number
}

interface PreviewProps {
	src: string
	config: PreviewConfig
	circleRadius: number
}

function applyColorAdjustments(
	r: number,
	g: number,
	b: number,
	brightness: number,
	saturation: number
): [number, number, number] {
	// apply brightness (0-200%)
	const brightnessFactor = brightness / 100
	r = Math.min(255, Math.max(0, r * brightnessFactor))
	g = Math.min(255, Math.max(0, g * brightnessFactor))
	b = Math.min(255, Math.max(0, b * brightnessFactor))

	// apply saturation (0-200%)
	const gray = 0.2989 * r + 0.587 * g + 0.114 * b
	const saturationFactor = saturation / 100
	r = Math.min(255, Math.max(0, gray + saturationFactor * (r - gray)))
	g = Math.min(255, Math.max(0, gray + saturationFactor * (g - gray)))
	b = Math.min(255, Math.max(0, gray + saturationFactor * (b - gray)))

	return [Math.round(r), Math.round(g), Math.round(b)]
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

export function Preview({ src, config, circleRadius }: PreviewProps) {
	const { cols, rows, gap, borderRadius, brightness, saturation } = config

	const elementSize = 30
	const spacing = elementSize + gap

	const totalWidth = cols * elementSize + (cols - 1) * gap
	const totalHeight = rows * elementSize + (rows - 1) * gap

	const RENDER_HEIGHT = 400
	const renderWidth = (totalWidth / totalHeight) * RENDER_HEIGHT

	const scaleX = renderWidth / totalWidth
	const scaleY = RENDER_HEIGHT / totalHeight

	const borderRadiusVB = Math.min(borderRadius / Math.min(scaleX, scaleY), Math.min(totalWidth, totalHeight) / 2)

	const circleRadiusVB = circleRadius

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

	// load image and compute average color per cell
	const [colors, setColors] = React.useState<string[][]>([])

	React.useEffect(() => {
		const img = new Image()
		img.crossOrigin = "anonymous"
		img.src = src
		img.onload = () => {
			const canvas = document.createElement("canvas")
			canvas.width = totalWidth
			canvas.height = totalHeight
			const ctx = canvas.getContext("2d")!

			// calculate dimensions to crop and center image without stretching
			const imgAspect = img.width / img.height
			const canvasAspect = totalWidth / totalHeight

			let drawWidth, drawHeight, drawX, drawY

			if (imgAspect > canvasAspect) {
				// image is wider than canvas - fit to height
				drawHeight = totalHeight
				drawWidth = totalHeight * imgAspect
				drawX = (totalWidth - drawWidth) / 2
				drawY = 0
			} else {
				// image is taller than canvas - fit to width
				drawWidth = totalWidth
				drawHeight = totalWidth / imgAspect
				drawX = 0
				drawY = (totalHeight - drawHeight) / 2
			}

			ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)

			const cellColors: string[][] = []

			for (let row = 0; row < rows; row++) {
				const rowColors: string[] = []
				for (let col = 0; col < cols; col++) {
					const x = col * spacing
					const y = row * spacing
					const imageData = ctx.getImageData(x, y, elementSize, elementSize)
					let r = 0,
						g = 0,
						b = 0
					const data = imageData.data
					for (let i = 0; i < data.length; i += 4) {
						r += data[i]
						g += data[i + 1]
						b += data[i + 2]
					}
					const count = data.length / 4
					const avgR = r / count
					const avgG = g / count
					const avgB = b / count

					// apply brightness and saturation adjustments
					const [adjustedR, adjustedG, adjustedB] = applyColorAdjustments(avgR, avgG, avgB, brightness, saturation)

					rowColors.push(`rgb(${adjustedR},${adjustedG},${adjustedB})`)
				}
				cellColors.push(rowColors)
			}

			setColors(cellColors)
		}
	}, [src, cols, rows, spacing, elementSize, totalWidth, totalHeight, brightness, saturation])

	return (
		<div className="w-full overflow-hidden" data-preview-container>
			<svg width="100%" viewBox={`0 0 ${totalWidth} ${totalHeight}`} preserveAspectRatio="xMidYMid meet">
				{visibleCells.map(({ row, col }) => {
					const color = colors[row]?.[col] || "#000"
					const cx = col * spacing + elementSize / 2
					const cy = row * spacing + elementSize / 2
					return <circle key={`${row}-${col}`} cx={cx} cy={cy} r={circleRadiusVB} fill={color} />
				})}
			</svg>
		</div>
	)
}
