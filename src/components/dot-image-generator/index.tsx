"use client"

import { ConfigControls } from "@/components/dot-image-generator/config-controls"
import { CropperControlled } from "@/components/dot-image-generator/cropper-controlled"
import { DownloadButton } from "@/components/dot-image-generator/download-button"
import { FileUpload } from "@/components/dot-image-generator/file-upload"
import { Preview } from "@/components/dot-image-generator/preview"
import { DEFAULT_CONFIG, ELEMENT_SIZE } from "@/lib/constants"
import type { PreviewConfig } from "@/types/config"
import { cn } from "@/utils"
import { downloadPNG, downloadSVG } from "@/utils/download"
import { ComponentProps, useEffect, useState } from "react"

export function DotImageGenerator(props: ComponentProps<"div">) {
	const [files, setFiles] = useState<File[]>([])
	const [imageUrls, setImageUrls] = useState<string[]>([])
	const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number } | null>(null)
	const [config, setConfig] = useState<PreviewConfig>(DEFAULT_CONFIG)

	// maximum border radius for the overall image
	const totalWidth = previewDimensions?.width || 0
	const totalHeight = previewDimensions?.height || 0
	const maxBorderRadius = Math.ceil(Math.min(totalWidth, totalHeight) / 2)

	// calculate dynamic dot radius based on available space and user setting
	const cellWidth = ELEMENT_SIZE // fixed cell size in preview component
	const cellHeight = ELEMENT_SIZE // fixed cell size in preview component
	const maxdotBorderRadius = Math.floor(Math.min(cellWidth, cellHeight) / 2)
	const dotBorderRadius = Math.floor(maxdotBorderRadius * config.dotBorderRadius)

	// ensure border radius never exceeds max
	useEffect(() => {
		setConfig((prev) => ({ ...prev, borderRadius: Math.min(prev.borderRadius, maxBorderRadius) }))
	}, [maxBorderRadius])

	// measure preview element dimensions
	useEffect(() => {
		const measurePreview = () => {
			const previewElement = document.querySelector("[data-preview-container]") as HTMLElement
			if (previewElement) {
				const rect = previewElement.getBoundingClientRect()
				setPreviewDimensions({ width: rect.width, height: rect.height })
			}
		}

		// initial measurement
		measurePreview()

		// set up resizeobserver to track dimension changes
		let resizeObserver: ResizeObserver
		const previewElement = document.querySelector("[data-preview-container]") as HTMLElement
		if (previewElement) {
			resizeObserver = new ResizeObserver(measurePreview)
			resizeObserver.observe(previewElement)
		}

		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect()
			}
		}
	}, [files]) // re-run when files change to ensure preview element exists

	// create urls for image previews
	useEffect(() => {
		if (files.length === 0) return

		// create urls for image previews
		const urls = files.map((file) => URL.createObjectURL(file))
		setImageUrls(urls)

		// cleanup object urls
		return () => urls.forEach((url) => URL.revokeObjectURL(url))
	}, [files])

	const updateConfig = (value: Partial<PreviewConfig>) => {
		let res = { ...config, ...value }

		// apply aspect ratio logic if cols or rows change and ratio is locked
		if (config.ratio && (value.cols || value.rows)) {
			if (value.cols) res.rows = Math.max(1, Math.round(value.cols / config.ratio))
			else if (value.rows) res.cols = Math.max(1, Math.round(value.rows * config.ratio))
		}

		setConfig(res)
	}

	const handleReset = () => setConfig(DEFAULT_CONFIG)

	const handleDownload = async (format: "png" | "svg") => {
		if (!imageUrls[0]) return
		if (format === "svg") await downloadSVG()
		else if (format === "png") await downloadPNG()
	}

	return (
		<div {...props} className={cn("flex w-full max-w-md flex-col items-center gap-10", props.className)}>
			<FileUpload files={files} onFilesChange={setFiles} />

			{/* <pre>{JSON.stringify(config, null, 2)}</pre> */}

			{files.length > 0 && (
				<>
					<CropperControlled imageSrc={imageUrls[0]} config={config} updateConfig={updateConfig} />

					<Preview src={imageUrls[0]} config={config} />

					<DownloadButton onDownload={handleDownload} disabled={!imageUrls[0]} className="w-full" />

					<ConfigControls
						config={config}
						updateConfig={updateConfig}
						maxBorderRadius={maxBorderRadius}
						onReset={handleReset}
						className="rounded-lg border"
					/>
				</>
			)}
		</div>
	)
}
