"use client"

import type { PreviewConfig } from "@/components/config-controls"
import { ConfigControls } from "@/components/config-controls"
import { FileUpload } from "@/components/file-upload"
import { Preview } from "@/components/preview"
import { cn } from "@/utils"
import React from "react"

interface Props {
	className?: string
}

export function DotImageGenerator({ className }: Props) {
	const [files, setFiles] = React.useState<File[]>([])
	const [imageUrls, setImageUrls] = React.useState<string[]>([])
	const [config, setConfig] = React.useState<PreviewConfig>({
		cols: 20,
		rows: 20,
		lockRatio: true,
		circleRadius: 15,
		gap: 10,
		borderRadius: 0,
	})
	const [ratio, setRatio] = React.useState(config.cols / config.rows)

	const actualRows = config.lockRatio ? config.cols : config.rows
	const elementSize = 30
	const totalWidth = config.cols * elementSize + (config.cols - 1) * config.gap
	const totalHeight = actualRows * elementSize + (actualRows - 1) * config.gap
	const maxBorderRadius = Math.min(totalWidth, totalHeight) / 2

	React.useEffect(() => {
		setConfig((prev) => {
			if (prev.borderRadius <= maxBorderRadius) return prev
			return { ...prev, borderRadius: maxBorderRadius }
		})
	}, [maxBorderRadius])

	React.useEffect(() => {
		// Create URLs for image previews
		const urls = files.map((file) => URL.createObjectURL(file))
		setImageUrls(urls)

		// Cleanup function to revoke object URLs
		return () => {
			urls.forEach((url) => URL.revokeObjectURL(url))
		}
	}, [files])

	React.useEffect(() => {
		// Update ratio when cols or rows change, but only when ratio is unlocked
		if (!config.lockRatio && config.rows > 0) {
			setRatio(config.cols / config.rows)
		}
	}, [config.cols, config.rows, config.lockRatio])

	const updateConfig = (key: keyof PreviewConfig, value: number | boolean) => {
		setConfig((prev) => {
			let newConfig = { ...prev, [key]: value }

			if (prev.lockRatio && (key === "cols" || key === "rows")) {
				if (key === "cols") {
					// Apply stored ratio to rows when cols change
					newConfig.rows = Math.max(1, Math.round((value as number) / ratio))
				} else if (key === "rows") {
					// Apply stored ratio to cols when rows change
					newConfig.cols = Math.max(1, Math.round((value as number) * ratio))
				}
			} else if (key === "lockRatio" && value === true) {
				// Store current ratio when locking
				if (prev.rows > 0) {
					setRatio(prev.cols / prev.rows)
				}
			}

			return newConfig
		})
	}

	const handleReset = () => {
		setConfig({
			cols: 10,
			rows: 10,
			lockRatio: true,
			circleRadius: 15,
			gap: 10,
			borderRadius: 0,
		})
	}

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

					<Preview src={imageUrls[0]} config={config} />
				</>
			)}
		</div>
	)
}
