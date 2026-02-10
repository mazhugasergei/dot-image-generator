import { ELEMENT_SIZE } from "@/lib/constants"
import { PreviewConfig } from "@/types/config"
import { cn } from "@/utils"
import { applyColorAdjustments } from "@/utils/colors"
import { isRectInsideRoundedRect } from "@/utils/dot"
import { ComponentProps, useCallback, useEffect, useRef, useState } from "react"

interface Props extends ComponentProps<"div"> {
	src: string
	config: PreviewConfig
	updateConfig?: (value: Partial<PreviewConfig>) => void
}

export function Preview({
	src,
	config: { cols, rows, borderRadius, dotBorderRadius, gap, brightness, saturation, crop, zoom, rotation },
	updateConfig,
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

	// Interactive state
	const containerRef = useRef<HTMLDivElement>(null)
	const isDraggingRef = useRef(false)
	const lastPointRef = useRef<{ x: number; y: number } | null>(null)
	const isPinchingRef = useRef(false)
	const lastDistanceRef = useRef(0)
	const lastRotationRef = useRef(0)

	// Convert screen coordinates to canvas coordinates
	const screenToCanvas = useCallback(
		(screenX: number, screenY: number) => {
			if (!containerRef.current) return { x: 0, y: 0 }
			const rect = containerRef.current.getBoundingClientRect()
			const svg = containerRef.current.querySelector("svg")
			if (!svg) return { x: 0, y: 0 }

			const svgRect = svg.getBoundingClientRect()
			const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, totalWidth, totalHeight]

			const x = ((screenX - svgRect.left) / svgRect.width) * viewBox[2]
			const y = ((screenY - svgRect.top) / svgRect.height) * viewBox[3]

			return { x, y }
		},
		[totalWidth, totalHeight]
	)

	// Handle mouse/touch drag
	const handleDragStart = useCallback(
		(clientX: number, clientY: number) => {
			if (!updateConfig) return
			isDraggingRef.current = true
			lastPointRef.current = { x: clientX, y: clientY }
		},
		[updateConfig]
	)

	const handleDragMove = useCallback(
		(clientX: number, clientY: number) => {
			if (!updateConfig || !isDraggingRef.current || !lastPointRef.current) return

			// Calculate pointer movement distance
			const deltaX = clientX - lastPointRef.current.x
			const deltaY = clientY - lastPointRef.current.y

			// Get SVG dimensions for coordinate conversion
			const svg = containerRef.current?.querySelector("svg")
			if (!svg) return

			const svgRect = svg.getBoundingClientRect()
			const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, totalWidth, totalHeight]

			// Convert pixel movement to canvas units
			const scaleX = viewBox[2] / svgRect.width
			const scaleY = viewBox[3] / svgRect.height

			// Calculate drag distance in canvas coordinates
			const dragDistanceX = deltaX * scaleX
			const dragDistanceY = deltaY * scaleY

			// Calculate transformed image dimensions
			// Base image dimensions (assuming image covers the full canvas)
			const imageWidth = totalWidth
			const imageHeight = totalHeight

			// Apply zoom to dimensions
			const scaledWidth = imageWidth * zoom
			const scaledHeight = imageHeight * zoom

			// Apply rotation to calculate bounding box
			const rotationRad = (rotation * Math.PI) / 180
			const cosRotation = Math.abs(Math.cos(rotationRad))
			const sinRotation = Math.abs(Math.sin(rotationRad))

			// Calculate rotated bounding box dimensions
			const rotatedWidth = scaledWidth * cosRotation + scaledHeight * sinRotation
			const rotatedHeight = scaledWidth * sinRotation + scaledHeight * cosRotation

			// Calculate drag limits as ±90% of transformed image dimensions
			// Convert to percentage of canvas size
			const maxNegativeX = ((-rotatedWidth * 0.9) / totalWidth) * 100
			const maxPositiveX = ((rotatedWidth * 0.9) / totalWidth) * 100
			const maxNegativeY = ((-rotatedHeight * 0.9) / totalHeight) * 100
			const maxPositiveY = ((rotatedHeight * 0.9) / totalHeight) * 100

			// Update crop position with calculated limits
			const newCropX = Math.max(maxNegativeX, Math.min(maxPositiveX, crop.x + (dragDistanceX / totalWidth) * 100))
			const newCropY = Math.max(maxNegativeY, Math.min(maxPositiveY, crop.y + (dragDistanceY / totalHeight) * 100))

			updateConfig({ crop: { x: newCropX, y: newCropY } })

			// Update last pointer position for next frame
			lastPointRef.current = { x: clientX, y: clientY }
		},
		[updateConfig, crop, totalWidth, totalHeight, zoom, rotation]
	)

	const handleDragEnd = useCallback(() => {
		isDraggingRef.current = false
		lastPointRef.current = null
	}, [])

	// Handle pinch zoom
	const handlePinchStart = useCallback(
		(distance: number, rotation: number) => {
			if (!updateConfig) return
			isPinchingRef.current = true
			lastDistanceRef.current = distance
			lastRotationRef.current = rotation
		},
		[updateConfig]
	)

	const handlePinchMove = useCallback(
		(distance: number, rotation: number) => {
			if (!updateConfig || !isPinchingRef.current) return

			// Handle zoom
			const zoomDelta = distance / lastDistanceRef.current
			const newZoom = Math.max(0.5, Math.min(3, zoom * zoomDelta))
			updateConfig({ zoom: newZoom })

			// Handle rotation
			const rotationDelta = rotation - lastRotationRef.current
			const newRotation = rotation + rotationDelta
			updateConfig({ rotation: newRotation })

			lastDistanceRef.current = distance
			lastRotationRef.current = rotation
		},
		[updateConfig, zoom, rotation]
	)

	const handlePinchEnd = useCallback(() => {
		isPinchingRef.current = false
	}, [])

	// Mouse events
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (e.button === 0) {
				// Left click only
				handleDragStart(e.clientX, e.clientY)
			}
		},
		[handleDragStart]
	)

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			handleDragMove(e.clientX, e.clientY)
		},
		[handleDragMove]
	)

	const handleMouseUp = useCallback(() => {
		handleDragEnd()
	}, [handleDragEnd])

	// Touch events
	const handleTouchStart = useCallback(
		(e: React.TouchEvent) => {
			if (e.touches.length === 1) {
				const touch = e.touches[0]
				handleDragStart(touch.clientX, touch.clientY)
			} else if (e.touches.length === 2) {
				const touch1 = e.touches[0]
				const touch2 = e.touches[1]
				const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
				const rotation = (Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180) / Math.PI
				handlePinchStart(distance, rotation)
			}
		},
		[handleDragStart, handlePinchStart]
	)

	const handleTouchMove = useCallback(
		(e: React.TouchEvent) => {
			if (e.touches.length === 1) {
				const touch = e.touches[0]
				handleDragMove(touch.clientX, touch.clientY)
			} else if (e.touches.length === 2) {
				const touch1 = e.touches[0]
				const touch2 = e.touches[1]
				const distance = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY)
				const rotation = (Math.atan2(touch2.clientY - touch1.clientY, touch2.clientX - touch1.clientX) * 180) / Math.PI
				handlePinchMove(distance, rotation)
			}
		},
		[handleDragMove, handlePinchMove]
	)

	const handleTouchEnd = useCallback(() => {
		handleDragEnd()
		handlePinchEnd()
	}, [handleDragEnd, handlePinchEnd])

	// Wheel zoom
	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			if (!updateConfig) return
			e.preventDefault()

			// Get pointer position relative to SVG
			const svg = containerRef.current?.querySelector("svg")
			if (!svg) return

			const svgRect = svg.getBoundingClientRect()
			const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, totalWidth, totalHeight]

			// Calculate pointer position in canvas coordinates
			const pointerX = ((e.clientX - svgRect.left) / svgRect.width) * viewBox[2]
			const pointerY = ((e.clientY - svgRect.top) / svgRect.height) * viewBox[3]

			// Calculate zoom delta
			const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1
			const newZoom = Math.max(0.5, Math.min(3, zoom * zoomDelta))

			// Calculate the offset needed to keep pointer position fixed
			// For center-based transforms, we need to calculate the offset differently
			const centerOffsetX = pointerX - totalWidth / 2
			const centerOffsetY = pointerY - totalHeight / 2

			// Calculate how much the offset changes with zoom
			const zoomRatio = newZoom / zoom
			const newCenterOffsetX = centerOffsetX * zoomRatio
			const newCenterOffsetY = centerOffsetY * zoomRatio

			// Calculate the crop offset needed to keep pointer fixed
			// The difference in center offsets determines how much we need to adjust crop
			const cropOffsetX = (newCenterOffsetX - centerOffsetX) / zoom
			const cropOffsetY = (newCenterOffsetY - centerOffsetY) / zoom

			// Apply the offset to current crop position
			const newCropX = Math.max(-50, Math.min(50, crop.x - (cropOffsetX / totalWidth) * 100))
			const newCropY = Math.max(-50, Math.min(50, crop.y - (cropOffsetY / totalHeight) * 100))

			updateConfig({ zoom: newZoom, crop: { x: newCropX, y: newCropY } })
		},
		[updateConfig, zoom, crop, totalWidth, totalHeight]
	)

	useEffect(() => {
		const container = containerRef.current
		if (!container || !updateConfig) return

		const handleWheelEvent = (e: WheelEvent) => {
			e.preventDefault()

			// Get pointer position relative to SVG
			const svg = container.querySelector("svg")
			if (!svg) return

			const svgRect = svg.getBoundingClientRect()
			const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, totalWidth, totalHeight]

			// Calculate pointer position in canvas coordinates
			const pointerX = ((e.clientX - svgRect.left) / svgRect.width) * viewBox[2]
			const pointerY = ((e.clientY - svgRect.top) / svgRect.height) * viewBox[3]

			// Calculate zoom delta
			const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1
			const newZoom = Math.max(0.5, Math.min(3, zoom * zoomDelta))

			// Calculate the offset needed to keep pointer position fixed
			// For center-based transforms, we need to calculate the offset differently
			const centerOffsetX = pointerX - totalWidth / 2
			const centerOffsetY = pointerY - totalHeight / 2

			// Calculate how much the offset changes with zoom
			const zoomRatio = newZoom / zoom
			const newCenterOffsetX = centerOffsetX * zoomRatio
			const newCenterOffsetY = centerOffsetY * zoomRatio

			// Calculate the crop offset needed to keep pointer fixed
			// The difference in center offsets determines how much we need to adjust crop
			const cropOffsetX = (newCenterOffsetX - centerOffsetX) / zoom
			const cropOffsetY = (newCenterOffsetY - centerOffsetY) / zoom

			// Apply the offset to current crop position
			const newCropX = Math.max(-50, Math.min(50, crop.x - (cropOffsetX / totalWidth) * 100))
			const newCropY = Math.max(-50, Math.min(50, crop.y - (cropOffsetY / totalHeight) * 100))

			updateConfig({ zoom: newZoom, crop: { x: newCropX, y: newCropY } })
		}

		container.addEventListener("wheel", handleWheelEvent, { passive: false })

		return () => {
			container.removeEventListener("wheel", handleWheelEvent)
		}
	}, [updateConfig, zoom, crop, totalWidth, totalHeight])

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

			// Apply transformations from center
			// First translate to center, then apply transforms, then translate back
			ctx.translate(totalWidth / 2, totalHeight / 2)
			ctx.rotate((rotation * Math.PI) / 180)
			ctx.scale(zoom, zoom)
			ctx.translate(-totalWidth / 2, -totalHeight / 2)

			// Apply crop offset (moves the image within the transformed space)
			ctx.translate(cropXPixels, cropYPixels)

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
		<div {...props} className={cn("w-full", props.className)} data-preview-container ref={containerRef}>
			<svg
				width="100%"
				viewBox={`0 0 ${totalWidth} ${totalHeight}`}
				preserveAspectRatio="xMidYMid meet"
				style={{ cursor: updateConfig ? "grab" : "default" }}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
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
