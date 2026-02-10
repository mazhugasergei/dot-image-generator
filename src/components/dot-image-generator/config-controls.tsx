"use client"

import { Slider } from "@/components/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DEFAULT_CONFIG, MAX_CONFIG_VALUES } from "@/lib/constants"
import type { PreviewConfig } from "@/types/config"
import { cn } from "@/utils"
import { LockIcon, LockOpenIcon, RotateCcwIcon } from "lucide-react"
import { useRef } from "react"

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
	config: PreviewConfig
	updateConfig: (value: Partial<PreviewConfig>) => void
	maxBorderRadius: number
	onReset?: () => void
}

export function ConfigControls({ config, updateConfig, maxBorderRadius, onReset, className, ...props }: Props) {
	const lastValues = useRef({ cols: config.cols, rows: config.rows })

	const handleReset = () => {
		Object.entries(DEFAULT_CONFIG).forEach(([key, value]) => updateConfig({ [key]: value }))
		lastValues.current = { cols: DEFAULT_CONFIG.cols, rows: DEFAULT_CONFIG.rows }
		onReset?.()
	}

	return (
		<div className={cn("w-full", className)} {...props}>
			<div className="flex items-center justify-between p-4">
				<h3 className="text-lg font-medium">Configuration</h3>
				{onReset && (
					<Button variant="outline" size="icon-sm" onClick={handleReset}>
						<RotateCcwIcon />
					</Button>
				)}
			</div>

			{/* transformation controls */}
			<div className="space-y-4 border-t p-4">
				<div className="flex items-center justify-between">
					<h4 className="text-muted-foreground text-sm font-medium">Transform</h4>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() => updateConfig({ crop: { x: 0, y: 0 }, zoom: 1, rotation: 0 })}
					>
						<RotateCcwIcon />
					</Button>
				</div>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
					{/* zoom */}
					<div className="space-y-2">
						<Slider
							id="zoom"
							label="Zoom"
							min={0.5}
							max={3}
							step={0.1}
							value={[config.zoom]}
							onValueChange={(value) => updateConfig({ zoom: value[0] ?? 1 })}
						/>
					</div>

					{/* rotation */}
					<div className="space-y-2">
						<Slider
							id="rotation"
							label="Rotation"
							min={-180}
							max={180}
							step={1}
							value={[config.rotation]}
							onValueChange={(value) => updateConfig({ rotation: value[0] ?? 0 })}
						/>
					</div>
				</div>
			</div>

			{/* layout controls */}
			<div className="space-y-4 border-t p-4">
				<div className="flex items-center justify-between">
					<h4 className="text-muted-foreground text-sm font-medium">Layout</h4>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() =>
							updateConfig({ cols: DEFAULT_CONFIG.cols, rows: DEFAULT_CONFIG.rows, ratio: DEFAULT_CONFIG.ratio })
						}
					>
						<RotateCcwIcon />
					</Button>
				</div>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
					{/* columns */}
					<div className="flex w-full flex-col gap-2.5">
						<Slider
							id="cols"
							label="Columns"
							min={1}
							max={MAX_CONFIG_VALUES.cols}
							step={1}
							value={[config.cols]}
							onValueChange={(value) => updateConfig({ cols: value[0] ?? 1 })}
							onValueCommit={(value) => {
								const newCols = value[0] ?? 1
								if (config.ratio) {
									const delta = newCols - lastValues.current.cols
									const newRows = Math.max(1, lastValues.current.rows + delta)
									updateConfig({ rows: newRows })
									lastValues.current = { cols: newCols, rows: newRows }
								} else {
									lastValues.current.cols = newCols
								}
							}}
						/>
					</div>

					{/* rows */}
					<div className="flex w-full flex-col gap-2.5">
						<Slider
							id="rows"
							label="Rows"
							min={1}
							max={MAX_CONFIG_VALUES.rows}
							step={1}
							value={[config.rows]}
							onValueChange={(value) => updateConfig({ rows: value[0] ?? 1 })}
							onValueCommit={(value) => {
								const newRows = value[0] ?? 1
								if (config.ratio) {
									const delta = newRows - lastValues.current.rows
									const newCols = Math.max(1, lastValues.current.cols + delta)
									updateConfig({ cols: newCols })
									lastValues.current = { cols: newCols, rows: newRows }
								} else {
									lastValues.current.rows = newRows
								}
							}}
						/>
					</div>

					{/* lock ratio */}
					<div className="space-y-2">
						<Label htmlFor="ratio">Lock Ratio</Label>
						<Button
							id="ratio"
							variant="outline"
							size="sm"
							onClick={() => updateConfig({ ratio: config.ratio ? null : config.cols / config.rows })}
							className="w-full"
						>
							{config.ratio ? (
								<>
									<LockIcon className="size-3" />
									Locked
								</>
							) : (
								<>
									<LockOpenIcon className="size-3" />
									Unlocked
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* style controls */}
			<div className="space-y-4 border-t p-4">
				<div className="flex items-center justify-between">
					<h4 className="text-muted-foreground text-sm font-medium">Style</h4>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() =>
							updateConfig({
								borderRadius: DEFAULT_CONFIG.borderRadius,
								dotBorderRadius: DEFAULT_CONFIG.dotBorderRadius,
								gap: DEFAULT_CONFIG.gap,
							})
						}
					>
						<RotateCcwIcon />
					</Button>
				</div>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
					{/* border radius */}
					<div className="space-y-2">
						<Slider
							id="borderRadius"
							label="Border Radius"
							min={0}
							max={maxBorderRadius}
							step={1}
							value={[config.borderRadius]}
							onValueChange={(value) => updateConfig({ borderRadius: value[0] ?? 0 })}
						/>
					</div>

					{/* dot border radius */}
					<div className="space-y-2">
						<Slider
							id="dotBorderRadius"
							label="Dot Border Radius"
							min={0}
							max={MAX_CONFIG_VALUES.dotBorderRadius}
							step={0.01}
							value={[config.dotBorderRadius]}
							onValueChange={(value) => updateConfig({ dotBorderRadius: value[0] ?? 0 })}
						/>
					</div>

					{/* gap */}
					<div className="space-y-2">
						<Slider
							id="gap"
							label="Gap"
							min={0}
							max={MAX_CONFIG_VALUES.gap}
							step={1}
							value={[config.gap]}
							onValueChange={(value) => updateConfig({ gap: value[0] ?? 0 })}
						/>
					</div>
				</div>
			</div>

			{/* color controls */}
			<div className="space-y-4 border-t p-4">
				<div className="flex items-center justify-between">
					<h4 className="text-muted-foreground text-sm font-medium">Colors</h4>
					<Button
						variant="outline"
						size="icon-sm"
						onClick={() =>
							updateConfig({ brightness: DEFAULT_CONFIG.brightness, saturation: DEFAULT_CONFIG.saturation })
						}
					>
						<RotateCcwIcon />
					</Button>
				</div>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
					{/* brightness */}
					<div className="space-y-2">
						<Slider
							id="brightness"
							label="Brightness"
							min={0}
							max={MAX_CONFIG_VALUES.brightness}
							step={1}
							value={[config.brightness]}
							onValueChange={(value) => updateConfig({ brightness: value[0] ?? 100 })}
						/>
					</div>

					{/* saturation */}
					<div className="space-y-2">
						<Slider
							id="saturation"
							label="Saturation"
							min={0}
							max={MAX_CONFIG_VALUES.saturation}
							step={1}
							value={[config.saturation]}
							onValueChange={(value) => updateConfig({ saturation: value[0] ?? 100 })}
						/>
					</div>
				</div>
			</div>
		</div>
	)
}
