"use client"

import { ConfigControls } from "@/components/dot-image-generator/config-controls"
import { DownloadButton } from "@/components/dot-image-generator/download-button"
import { FileUpload } from "@/components/dot-image-generator/file-upload"
import { Preview } from "@/components/dot-image-generator/preview"
import { DEFAULT_CONFIG } from "@/lib/constants"
import type { PreviewConfig } from "@/types/config"
import { cn } from "@/utils"
import { ComponentProps, useEffect, useState } from "react"

export function DotImageGenerator({ className, ...props }: ComponentProps<"div">) {
	const [files, setFiles] = useState<File[]>([])
	const [imageUrls, setImageUrls] = useState<string[]>([])
	const [previewDimensions, setPreviewDimensions] = useState<{ width: number; height: number } | null>(null)
	const [config, setConfig] = useState<PreviewConfig>(DEFAULT_CONFIG)

	// maximum border radius for the overall image
	const totalWidth = previewDimensions?.width || 0
	const totalHeight = previewDimensions?.height || 0
	const maxBorderRadius = Math.ceil(Math.min(totalWidth, totalHeight) / 2)

	function measurePreview() {
		const previewElement = document.querySelector("[data-preview-container]") as HTMLElement
		if (previewElement) {
			const rect = previewElement.getBoundingClientRect()
			setPreviewDimensions({ width: rect.width, height: rect.height })
		}
	}

	// measure preview element dimensions and recalculate maxBorderRadius
	useEffect(() => {
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
	}, [files])

	// create urls for image previews
	useEffect(() => {
		if (files.length === 0) return

		// create urls for image previews
		const urls = files.map((file) => URL.createObjectURL(file))
		setImageUrls(urls)

		// cleanup object urls
		return () => urls.forEach((url) => URL.revokeObjectURL(url))
	}, [files])

	function updateConfig(value: Partial<PreviewConfig>) {
		let res = { ...config, ...value }

		// apply aspect ratio logic if cols or rows change and ratio is locked
		if (res.ratio && (value.cols || value.rows)) {
			if (value.cols) res.rows = Math.max(1, Math.round(value.cols / res.ratio))
			else if (value.rows) res.cols = Math.max(1, Math.round(value.rows * res.ratio))
		}

		setConfig(res)
	}

	return (
		<div
			className={cn(
				"grid w-full items-center gap-10 max-lg:max-w-md",
				files.length > 0 ? "lg:grid-cols-2" : "max-w-lg",
				className
			)}
			{...props}
		>
			{files.length > 0 && (
				<div className="space-y-6">
					<Preview
						src={imageUrls[0]}
						config={config}
						updateConfig={updateConfig}
						maxBorderRadius={maxBorderRadius}
						containerWidth={totalWidth}
						containerHeight={totalHeight}
					/>
					<DownloadButton />
				</div>
			)}

			<div className="space-y-6">
				<FileUpload files={files} onFilesChange={setFiles} />
				{files.length > 0 && (
					<ConfigControls
						config={config}
						updateConfig={updateConfig}
						maxBorderRadius={maxBorderRadius}
						className="rounded-lg border"
					/>
				)}
			</div>
		</div>
	)
}
