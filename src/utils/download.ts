function getPreviewSVG(): SVGElement {
	const previewContainer = document.querySelector("[data-preview-container]") as HTMLElement
	const svgElement = previewContainer?.querySelector("svg") as SVGElement

	if (!svgElement) {
		throw new Error("Preview SVG not found")
	}

	return svgElement
}

export async function downloadSVG(filename: string = "dot-image.svg") {
	const svgElement = getPreviewSVG()
	const svgData = new XMLSerializer().serializeToString(svgElement)
	const blob = new Blob([svgData], { type: "image/svg+xml" })
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = filename
	a.click()
	URL.revokeObjectURL(url)
}

export async function downloadPNG(
	filename: string = "dot-image.png",
	targetWidth: number = 600,
	targetHeight: number = 600
) {
	const svgElement = getPreviewSVG()
	const svgData = new XMLSerializer().serializeToString(svgElement)
	const img = new Image()

	// Get SVG dimensions from viewBox or attributes
	const viewBox = svgElement.getAttribute("viewBox")
	let vbWidth = 0,
		vbHeight = 0
	if (viewBox) {
		const parts = viewBox.split(/\s+|,/).map(Number)
		vbWidth = parts[2]
		vbHeight = parts[3]
	} else {
		vbWidth = parseFloat(svgElement.getAttribute("width") || "0")
		vbHeight = parseFloat(svgElement.getAttribute("height") || "0")
	}

	// Calculate target dimensions while preserving aspect ratio
	let finalWidth = targetWidth
	let finalHeight = targetHeight

	if (targetWidth && !targetHeight) {
		finalHeight = (vbHeight / vbWidth) * targetWidth
	} else if (!targetWidth && targetHeight) {
		finalWidth = (vbWidth / vbHeight) * targetHeight
	}

	return new Promise<void>((resolve, reject) => {
		img.onload = () => {
			const canvas = document.createElement("canvas")
			canvas.width = finalWidth
			canvas.height = finalHeight
			const ctx = canvas.getContext("2d")
			if (!ctx) return reject(new Error("Failed to get canvas context"))

			ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

			canvas.toBlob((blob) => {
				if (blob) {
					const url = URL.createObjectURL(blob)
					const a = document.createElement("a")
					a.href = url
					a.download = filename
					a.click()
					URL.revokeObjectURL(url)
					resolve()
				} else {
					reject(new Error("Failed to create PNG blob"))
				}
			}, "image/png")
		}

		img.onerror = () => reject(new Error("Failed to load SVG for PNG conversion"))

		const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" })
		img.src = URL.createObjectURL(svgBlob)
	})
}
