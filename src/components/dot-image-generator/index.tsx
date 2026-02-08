"use client"

import { ConfigControls } from "@/components/dot-image-generator/config-controls"
import { CropperControlled } from "@/components/dot-image-generator/cropper-controlled"
import { DownloadButton } from "@/components/dot-image-generator/download-button"
import { FileUpload } from "@/components/dot-image-generator/file-upload"
import { Preview } from "@/components/dot-image-generator/preview"
import { CropperPoint } from "@/components/ui/cropper"
import { DEFAULT_CONFIG, ELEMENT_SIZE } from "@/lib/constants"
import type { PreviewConfig } from "@/types/config"
import { cn } from "@/utils"
import { downloadPNG, downloadSVG } from "@/utils/download"
import React from "react"

interface Props {
	className?: string
}

export function DotImageGenerator({ className }: Props) {
	const [files, setFiles] = React.useState<File[]>([])
	const [imageUrls, setImageUrls] = React.useState<string[]>([])
	const [previewDimensions, setPreviewDimensions] = React.useState<{ width: number; height: number } | null>(null)
	const [config, setConfig] = React.useState<PreviewConfig>(DEFAULT_CONFIG)
	const [ratio, setRatio] = React.useState(config.cols / config.rows)
	const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 })
	const [zoom, setZoom] = React.useState(1)
	const [rotation, setRotation] = React.useState(0)

	// maximum border radius for the overall image
	const totalWidth = previewDimensions?.width || 0
	const totalHeight = previewDimensions?.height || 0
	const maxBorderRadius = Math.ceil(Math.min(totalWidth, totalHeight) / 2)

	// calculate dynamic circle radius based on available space and user setting
	const cellWidth = ELEMENT_SIZE // fixed cell size in preview component
	const cellHeight = ELEMENT_SIZE // fixed cell size in preview component
	const maxCircleRadius = Math.floor(Math.min(cellWidth, cellHeight) / 2)
	const circleRadius = Math.floor(maxCircleRadius * config.circleRadius)

	// ensure border radius never exceeds max
	React.useEffect(() => {
		setConfig((prev) => {
			if (prev.borderRadius <= maxBorderRadius) return prev
			return { ...prev, borderRadius: maxBorderRadius }
		})
	}, [maxBorderRadius])

	// measure preview element dimensions
	React.useEffect(() => {
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

	React.useEffect(() => {
		if (files.length === 0) return

		// create urls for image previews
		const urls = files.map((file) => URL.createObjectURL(file))
		setImageUrls(urls)

		// cleanup object urls
		return () => urls.forEach((url) => URL.revokeObjectURL(url))
	}, [files])

	React.useEffect(() => {
		// update ratio only when unlocked
		if (!config.lockRatio && config.rows > 0) {
			setRatio(config.cols / config.rows)
		}
	}, [config.cols, config.rows, config.lockRatio])

	const updateConfig = (key: keyof PreviewConfig, value: number | boolean) => {
		setConfig((prev) => {
			let newConfig = { ...prev, [key]: value }

			if (prev.lockRatio && (key === "cols" || key === "rows")) {
				if (key === "cols") {
					newConfig.rows = Math.max(1, Math.round((value as number) / ratio))
				} else if (key === "rows") {
					newConfig.cols = Math.max(1, Math.round((value as number) * ratio))
				}
			} else if (key === "lockRatio" && value === true) {
				if (prev.rows > 0) {
					setRatio(prev.cols / prev.rows)
				}
			}

			return newConfig
		})
	}

	const handleReset = () => setConfig(DEFAULT_CONFIG)

	const handleDownload = async (format: "png" | "svg") => {
		if (!imageUrls[0]) return

		if (format === "svg") {
			await downloadSVG()
		} else if (format === "png") {
			await downloadPNG()
		}
	}

	return (
		<div className={cn("flex w-full max-w-md flex-col items-center gap-10", className)}>
			<FileUpload files={files} onFilesChange={setFiles} />

			{files.length > 0 && (
				<>
					<CropperControlled
						imageSrc={imageUrls[0]}
						crop={crop}
						zoom={zoom}
						rotation={rotation}
						onCropChange={setCrop}
						onZoomChange={setZoom}
						onRotationChange={setRotation}
					/>

					<Preview src={imageUrls[0]} config={config} circleRadius={circleRadius} />

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
