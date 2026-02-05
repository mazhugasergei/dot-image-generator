"use client"

import type { PreviewConfig } from "@/components/config-controls"
import { ConfigControls } from "@/components/config-controls"
import { FileUpload } from "@/components/file-upload"
import { Preview } from "@/components/preview"
import { DEFAULT_CONFIG, ELEMENT_SIZE } from "@/lib/constants"
import { cn } from "@/utils"
import React from "react"

interface Props {
	className?: string
}

export function DotImageGenerator({ className }: Props) {
	const [files, setFiles] = React.useState<File[]>([])
	const [imageUrls, setImageUrls] = React.useState<string[]>([])
	const [imageDimensions, setImageDimensions] = React.useState<{ width: number; height: number } | null>(null)
	const [config, setConfig] = React.useState<PreviewConfig>(DEFAULT_CONFIG)
	const [ratio, setRatio] = React.useState(config.cols / config.rows)

	const elementSize = ELEMENT_SIZE

	const totalWidth = imageDimensions
		? imageDimensions.width
		: config.cols * elementSize + (config.cols - 1) * config.gap
	const totalHeight = imageDimensions
		? imageDimensions.height
		: config.rows * elementSize + (config.rows - 1) * config.gap

	// Maximum border radius for the overall image
	const maxBorderRadius = Math.ceil(Math.min(totalWidth, totalHeight) / 2)

	// Calculate dynamic circle radius based on available space and user setting
	const cellWidth = ELEMENT_SIZE // Fixed cell size in Preview component
	const cellHeight = ELEMENT_SIZE // Fixed cell size in Preview component
	const maxCircleRadius = Math.floor(Math.min(cellWidth, cellHeight) / 2)
	const circleRadius = Math.floor(maxCircleRadius * config.circleRadius)

	// Ensure border radius never exceeds max
	React.useEffect(() => {
		setConfig((prev) => {
			if (prev.borderRadius <= maxBorderRadius) return prev
			return { ...prev, borderRadius: maxBorderRadius }
		})
	}, [maxBorderRadius])

	React.useEffect(() => {
		if (files.length === 0) return

		// Create URLs for image previews
		const urls = files.map((file) => URL.createObjectURL(file))
		setImageUrls(urls)

		// Get image dimensions
		if (urls.length > 0) {
			const img = new Image()
			img.onload = () => {
				setImageDimensions({ width: img.width, height: img.height })
			}
			img.src = urls[0]
		} else {
			setImageDimensions(null)
		}

		// Cleanup object URLs
		return () => urls.forEach((url) => URL.revokeObjectURL(url))
	}, [files])

	React.useEffect(() => {
		// Update ratio only when unlocked
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

	return (
		<div className={cn("flex w-full max-w-md flex-col items-center gap-6", className)}>
			<FileUpload files={files} onFilesChange={setFiles} />

			{files.length > 0 && (
				<>
					<ConfigControls
						config={config}
						updateConfig={updateConfig}
						maxBorderRadius={maxBorderRadius}
						onReset={handleReset}
					/>

					<Preview src={imageUrls[0]} config={config} circleRadius={circleRadius} />
				</>
			)}
		</div>
	)
}
