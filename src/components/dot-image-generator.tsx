"use client"

import { FileUpload } from "@/components/file-upload"
import { Preview } from "@/components/preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/utils"
import React from "react"

interface Props {
	className?: string
}

interface PreviewConfig {
	cols: number
	rows: number
	lockRatio: boolean
	circleRadius: number
	gap: number
	borderRadius: number
}

export function DotImageGenerator({ className }: Props) {
	const [files, setFiles] = React.useState<File[]>([])
	const [imageUrls, setImageUrls] = React.useState<string[]>([])
	const [config, setConfig] = React.useState<PreviewConfig>({
		cols: 10,
		rows: 10,
		lockRatio: true,
		circleRadius: 15,
		gap: 10,
		borderRadius: 0,
	})

	React.useEffect(() => {
		console.log(files)

		// Create URLs for image previews
		const urls = files.map((file) => URL.createObjectURL(file))
		setImageUrls(urls)

		// Cleanup function to revoke object URLs
		return () => {
			urls.forEach((url) => URL.revokeObjectURL(url))
		}
	}, [files])

	const updateConfig = (key: keyof PreviewConfig, value: number | boolean) => {
		setConfig((prev) => {
			const newConfig = { ...prev, [key]: value }

			// If ratio is locked and changing cols or rows, sync both values
			if (prev.lockRatio && (key === "cols" || key === "rows")) {
				newConfig.cols = value as number
				newConfig.rows = value as number
			}

			return newConfig
		})
	}

	return (
		<div className={cn("flex w-full flex-col items-center gap-6", className)}>
			<FileUpload files={files} onFilesChange={setFiles} />

			{files.length > 0 && (
				<>
					<div className="space-y-4">
						<h3 className="text-lg font-medium">Configuration</h3>
						<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
							<div className="space-y-2">
								<Label htmlFor="cols">Columns</Label>
								<Input
									id="cols"
									type="number"
									min="1"
									max="50"
									value={config.cols}
									onChange={(e) => updateConfig("cols", parseInt(e.target.value) || 1)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="rows">Rows</Label>
								<Input
									id="rows"
									type="number"
									min="1"
									max="50"
									value={config.rows}
									onChange={(e) => updateConfig("rows", parseInt(e.target.value) || 1)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="lockRatio">Lock Ratio</Label>
								<Button
									id="lockRatio"
									variant={config.lockRatio ? "default" : "outline"}
									size="sm"
									onClick={() => updateConfig("lockRatio", !config.lockRatio)}
									className="w-full"
								>
									{config.lockRatio ? "Locked" : "Unlocked"}
								</Button>
							</div>

							<div className="space-y-2">
								<Label htmlFor="circleRadius">Circle Radius</Label>
								<Input
									id="circleRadius"
									type="number"
									min="1"
									max="50"
									value={config.circleRadius}
									onChange={(e) => updateConfig("circleRadius", parseInt(e.target.value) || 1)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="gap">Gap</Label>
								<Input
									id="gap"
									type="number"
									min="0"
									max="50"
									value={config.gap}
									onChange={(e) => updateConfig("gap", parseInt(e.target.value) || 0)}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="borderRadius">Border Radius</Label>
								<Input
									id="borderRadius"
									type="number"
									min="0"
									max="100"
									value={config.borderRadius}
									onChange={(e) => updateConfig("borderRadius", parseInt(e.target.value) || 0)}
								/>
							</div>
						</div>
					</div>

					<Preview
						src={imageUrls[0]}
						alt={files[0].name}
						cols={config.cols}
						rows={config.rows}
						lockRatio={config.lockRatio}
						circleRadius={config.circleRadius}
						gap={config.gap}
						borderRadius={config.borderRadius}
					/>
				</>
			)}
		</div>
	)
}
