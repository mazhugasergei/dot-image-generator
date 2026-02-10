import { ELEMENT_SIZE } from "@/lib/constants"
import { PreviewConfig } from "@/types/config"
import { cn } from "@/utils"
import { applyColorAdjustments } from "@/utils/colors"
import { isRectInsideRoundedRect } from "@/utils/dot"
import { ComponentProps, useCallback, useEffect, useRef, useState } from "react"

interface Props extends ComponentProps<"div"> {
	src: string
	config: PreviewConfig
	updateConfig: (value: Partial<PreviewConfig>) => void
	maxBorderRadius: number
}

export function Preview({
	src,
	config: { cols, rows, borderRadius, dotBorderRadius, gap, brightness, saturation, crop, zoom, rotation },
	updateConfig,
	className,
	maxBorderRadius,
	...props
}: Props) {
	const spacing = ELEMENT_SIZE + gap
	const totalWidth = cols * ELEMENT_SIZE + (cols - 1) * gap
	const totalHeight = rows * ELEMENT_SIZE + (rows - 1) * gap
	const actualBorderRadius = borderRadius * maxBorderRadius

	const visibleCells: Array<{ row: number; col: number }> = []
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			const x = col * spacing
			const y = row * spacing
			if (
				actualBorderRadius === 0 ||
				isRectInsideRoundedRect(x, y, ELEMENT_SIZE, ELEMENT_SIZE, totalWidth, totalHeight, actualBorderRadius)
			) {
				visibleCells.push({ row, col })
			}
		}
	}

	// load image and compute average color per cell
	const [colors, setColors] = useState<string[][]>([])

	// interactive state
	const containerRef = useRef<HTMLDivElement>(null)
	const isDraggingRef = useRef(false)
	const lastPointRef = useRef<{ x: number; y: number } | null>(null)
	const isPinchingRef = useRef(false)
	const lastDistanceRef = useRef(0)
	const lastRotationRef = useRef(0)

	// convert screen coordinates to canvas coordinates
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

	// handle mouse/touch drag
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

			// calculate pointer movement distance
			const deltaX = clientX - lastPointRef.current.x
			const deltaY = clientY - lastPointRef.current.y

			// get SVG dimensions for coordinate conversion
			const svg = containerRef.current?.querySelector("svg")
			if (!svg) return

			const svgRect = svg.getBoundingClientRect()
			const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, totalWidth, totalHeight]

			// convert pixel movement to canvas units
			const scaleX = viewBox[2] / svgRect.width
			const scaleY = viewBox[3] / svgRect.height

			// calculate drag distance in canvas coordinates
			const dragDistanceX = deltaX * scaleX
			const dragDistanceY = deltaY * scaleY

			// apply inverse zoom to drag distance (since zoom is applied before rotation)
			const adjustedDragX = dragDistanceX / zoom
			const adjustedDragY = dragDistanceY / zoom

			// calculate transformed image dimensions for limits
			// base image dimensions (assuming image covers the full canvas)
			const imageWidth = totalWidth
			const imageHeight = totalHeight

			// apply zoom to dimensions
			const scaledWidth = imageWidth * zoom
			const scaledHeight = imageHeight * zoom

			// apply rotation to calculate bounding box for limits
			const absRotationRad = (rotation * Math.PI) / 180
			const absCosRotation = Math.abs(Math.cos(absRotationRad))
			const absSinRotation = Math.abs(Math.sin(absRotationRad))

			// calculate rotated bounding box dimensions
			const rotatedWidth = scaledWidth * absCosRotation + scaledHeight * absSinRotation
			const rotatedHeight = scaledWidth * absSinRotation + scaledHeight * absCosRotation

			// calculate drag limits as ±90% of transformed image dimensions
			// convert to percentage of canvas size
			const maxNegativeX = ((-rotatedWidth * 0.9) / totalWidth) * 100
			const maxPositiveX = ((rotatedWidth * 0.9) / totalWidth) * 100
			const maxNegativeY = ((-rotatedHeight * 0.9) / totalHeight) * 100
			const maxPositiveY = ((rotatedHeight * 0.9) / totalHeight) * 100

			// update crop position with adjusted drag distance and limits
			const newCropX = Math.max(maxNegativeX, Math.min(maxPositiveX, crop.x + (adjustedDragX / totalWidth) * 100))
			const newCropY = Math.max(maxNegativeY, Math.min(maxPositiveY, crop.y + (adjustedDragY / totalHeight) * 100))

			updateConfig({ crop: { x: newCropX, y: newCropY } })

			// update last pointer position for next frame
			lastPointRef.current = { x: clientX, y: clientY }
		},
		[updateConfig, crop, totalWidth, totalHeight, zoom, rotation]
	)

	const handleDragEnd = useCallback(() => {
		isDraggingRef.current = false
		lastPointRef.current = null
	}, [])

	// handle pinch zoom
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

			// handle zoom
			const zoomDelta = distance / lastDistanceRef.current
			const newZoom = Math.max(0.5, Math.min(3, zoom * zoomDelta))
			updateConfig({ zoom: newZoom })

			// handle rotation
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

	// mouse events
	const handleMouseDown = useCallback(
		(e: React.MouseEvent) => {
			if (e.button === 0) {
				// left click only
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

	// touch events
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

	// wheel zoom
	const handleWheel = useCallback(
		(e: React.WheelEvent) => {
			if (!updateConfig) return
			e.preventDefault()

			// get pointer position relative to SVG
			const svg = containerRef.current?.querySelector("svg")
			if (!svg) return

			const svgRect = svg.getBoundingClientRect()
			const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, totalWidth, totalHeight]

			// calculate pointer position in canvas coordinates
			const pointerX = ((e.clientX - svgRect.left) / svgRect.width) * viewBox[2]
			const pointerY = ((e.clientY - svgRect.top) / svgRect.height) * viewBox[3]

			// calculate zoom delta
			const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1
			const newZoom = Math.max(0.5, Math.min(3, zoom * zoomDelta))

			// calculate the offset needed to keep pointer position fixed
			// for center-based transforms, we need to calculate the offset differently
			const centerOffsetX = pointerX - totalWidth / 2
			const centerOffsetY = pointerY - totalHeight / 2

			// calculate how much the offset changes with zoom
			const zoomRatio = newZoom / zoom
			const newCenterOffsetX = centerOffsetX * zoomRatio
			const newCenterOffsetY = centerOffsetY * zoomRatio

			// calculate the crop offset needed to keep pointer fixed
			// the difference in center offsets determines how much we need to adjust crop
			const cropOffsetX = (newCenterOffsetX - centerOffsetX) / zoom
			const cropOffsetY = (newCenterOffsetY - centerOffsetY) / zoom

			// apply the offset to current crop position
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

			// get pointer position relative to SVG
			const svg = container.querySelector("svg")
			if (!svg) return

			const svgRect = svg.getBoundingClientRect()
			const viewBox = svg.getAttribute("viewBox")?.split(" ").map(Number) || [0, 0, totalWidth, totalHeight]

			// calculate pointer position in canvas coordinates
			const pointerX = ((e.clientX - svgRect.left) / svgRect.width) * viewBox[2]
			const pointerY = ((e.clientY - svgRect.top) / svgRect.height) * viewBox[3]

			// calculate zoom delta
			const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1
			const newZoom = Math.max(0.5, Math.min(3, zoom * zoomDelta))

			// calculate the offset needed to keep pointer position fixed
			// for center-based transforms, we need to calculate the offset differently
			const centerOffsetX = pointerX - totalWidth / 2
			const centerOffsetY = pointerY - totalHeight / 2

			// calculate how much the offset changes with zoom
			const zoomRatio = newZoom / zoom
			const newCenterOffsetX = centerOffsetX * zoomRatio
			const newCenterOffsetY = centerOffsetY * zoomRatio

			// calculate the crop offset needed to keep pointer fixed
			// the difference in center offsets determines how much we need to adjust crop
			const cropOffsetX = (newCenterOffsetX - centerOffsetX) / zoom
			const cropOffsetY = (newCenterOffsetY - centerOffsetY) / zoom

			// apply the offset to current crop position
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

			// Apply transformations with rotation as the final step
			// First translate to center, apply zoom and crop, then rotate
			ctx.translate(totalWidth / 2, totalHeight / 2)
			ctx.scale(zoom, zoom)
			ctx.translate(-totalWidth / 2, -totalHeight / 2)

			// Apply crop offset (moves the image within the transformed space)
			ctx.translate(cropXPixels, cropYPixels)

			// Apply rotation as the final transformation
			ctx.translate(totalWidth / 2, totalHeight / 2)
			ctx.rotate((rotation * Math.PI) / 180)
			ctx.translate(-totalWidth / 2, -totalHeight / 2)

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
					const imageData = ctx.getImageData(x, y, ELEMENT_SIZE, ELEMENT_SIZE)
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
	}, [src, cols, rows, spacing, ELEMENT_SIZE, totalWidth, totalHeight, brightness, saturation, crop, zoom, rotation])

	return (
		<div data-preview-container ref={containerRef} className={cn("w-full", className)} {...props}>
			<svg
				width="100%"
				viewBox={`0 0 ${totalWidth} ${totalHeight}`}
				preserveAspectRatio="xMidYMid meet"
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				className="cursor-grab"
			>
				{visibleCells.map(({ row, col }) => {
					const color = colors[row]?.[col] || "#000"
					return (
						<rect
							key={`${row}-${col}`}
							x={col * spacing}
							y={row * spacing}
							width={ELEMENT_SIZE}
							height={ELEMENT_SIZE}
							rx={(dotBorderRadius / 2) * ELEMENT_SIZE}
							fill={color}
						/>
					)
				})}
			</svg>
		</div>
	)
}
