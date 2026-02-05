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

export async function downloadPNG(filename: string = "dot-image.png") {
	const svgElement = getPreviewSVG()
	const canvas = document.createElement("canvas")
	const ctx = canvas.getContext("2d")
	const svgData = new XMLSerializer().serializeToString(svgElement)
	const img = new Image()

	return new Promise<void>((resolve, reject) => {
		img.onload = () => {
			canvas.width = img.width
			canvas.height = img.height
			ctx?.drawImage(img, 0, 0)
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
