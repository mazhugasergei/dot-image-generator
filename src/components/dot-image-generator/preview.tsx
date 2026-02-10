import { ELEMENT_SIZE } from "@/lib/constants"
import { PreviewConfig } from "@/types/config"
import { cn } from "@/utils"
import { applyColorAdjustments } from "@/utils/colors"
import { isRectInsideRoundedRect } from "@/utils/dot"
import { ComponentProps, useEffect, useState } from "react"

interface Props extends ComponentProps<"div"> {
	src: string
	config: PreviewConfig
}

export function Preview({
	src,
	config: { cols, rows, borderRadius, dotBorderRadius, gap, brightness, saturation, crop, zoom, rotation },
	...props
}: Props) {
	const elementSize = ELEMENT_SIZE
	const spacing = elementSize + gap

	const totalWidth = cols * elementSize + (cols - 1) * gap
	const totalHeight = rows * elementSize + (rows - 1) * gap

	const RENDER_HEIGHT = 400
	const renderWidth = (totalWidth / totalHeight) * RENDER_HEIGHT

	const scaleX = renderWidth / totalWidth
	const scaleY = RENDER_HEIGHT / totalHeight

	const borderRadiusVB = Math.min(borderRadius / Math.min(scaleX, scaleY), Math.min(totalWidth, totalHeight) / 2)

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
	const [colors, setColors] = useState<string[][]>([])

	useEffect(() => {
		const img = new Image()
		img.crossOrigin = "anonymous"
		img.src = src
		img.onload = () => {
			const canvas = document.createElement("canvas")
			canvas.width = totalWidth
			canvas.height = totalHeight
			const ctx = canvas.getContext("2d")!

			// Save the original context state
			ctx.save()

			// Apply the same transformation logic as the cropper
			// Convert percentage crop to pixels (same as cropper does)
			const cropXPixels = (crop.x / 100) * totalWidth
			const cropYPixels = (crop.y / 100) * totalHeight

			// Apply cropper-style transform: translate, rotate, scale
			// This matches the cropper's CSS transform: translate(x, y) rotate(deg) scale(zoom)
			ctx.translate(cropXPixels, cropYPixels)
			ctx.rotate((rotation * Math.PI) / 180)
			ctx.scale(zoom, zoom)

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

			// Restore the original context state
			ctx.restore()

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
	}, [src, cols, rows, spacing, elementSize, totalWidth, totalHeight, brightness, saturation, crop, zoom, rotation])

	return (
		<div {...props} className={cn("w-full", props.className)} data-preview-container>
			<svg width="100%" viewBox={`0 0 ${totalWidth} ${totalHeight}`} preserveAspectRatio="xMidYMid meet">
				{visibleCells.map(({ row, col }) => {
					const color = colors[row]?.[col] || "#000"
					return (
						<rect
							key={`${row}-${col}`}
							x={col * spacing}
							y={row * spacing}
							width={elementSize}
							height={elementSize}
							rx={(dotBorderRadius / 2) * elementSize}
							fill={color}
						/>
					)
				})}
			</svg>
		</div>
	)
}
