"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { DEFAULT_CONFIG, MAX_CONFIG_VALUES } from "@/lib/constants"
import { PreviewConfig } from "@/types/config"
import { useRef } from "react"

export interface ConfigControlsProps {
	config: PreviewConfig
	updateConfig: (key: keyof PreviewConfig, value: number | boolean) => void
	maxBorderRadius: number
	onReset?: () => void
}

export function ConfigControls({ config, updateConfig, maxBorderRadius, onReset }: ConfigControlsProps) {
	const lastValues = useRef({ cols: config.cols, rows: config.rows })

	const handleReset = () => {
		Object.entries(DEFAULT_CONFIG).forEach(([key, value]) => updateConfig(key as keyof PreviewConfig, value))
		lastValues.current = { cols: DEFAULT_CONFIG.cols, rows: DEFAULT_CONFIG.rows }
		onReset?.()
	}

	return (
		<div className="w-full space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium">configuration</h3>
				<Button variant="outline" size="sm" onClick={handleReset}>
					Reset
				</Button>
			</div>
			{/* layout controls */}
			<div className="space-y-4">
				<h4 className="text-muted-foreground text-sm font-medium">layout</h4>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
					{/* columns */}
					<div className="space-y-2">
						<Label htmlFor="cols">Columns</Label>
						<div className="flex items-center gap-2">
							<Slider
								id="cols"
								min={1}
								max={MAX_CONFIG_VALUES.cols}
								step={1}
								value={[config.cols]}
								onValueChange={(value) => updateConfig("cols", value[0] ?? 1)}
								onValueCommit={(value) => {
									const newCols = value[0] ?? 1
									if (config.lockRatio) {
										const delta = newCols - lastValues.current.cols
										const newRows = Math.max(1, lastValues.current.rows + delta)
										updateConfig("rows", newRows)
										lastValues.current = { cols: newCols, rows: newRows }
									} else {
										lastValues.current.cols = newCols
									}
								}}
							/>
							<span className="text-muted-foreground w-12 text-sm">{config.cols}</span>
						</div>
					</div>

					{/* rows */}
					<div className="space-y-2">
						<Label htmlFor="rows">Rows</Label>
						<div className="flex items-center gap-2">
							<Slider
								id="rows"
								min={1}
								max={MAX_CONFIG_VALUES.rows}
								step={1}
								value={[config.rows]}
								onValueChange={(value) => updateConfig("rows", value[0] ?? 1)}
								onValueCommit={(value) => {
									const newRows = value[0] ?? 1
									if (config.lockRatio) {
										const delta = newRows - lastValues.current.rows
										const newCols = Math.max(1, lastValues.current.cols + delta)
										updateConfig("cols", newCols)
										lastValues.current = { cols: newCols, rows: newRows }
									} else {
										lastValues.current.rows = newRows
									}
								}}
							/>
							<span className="text-muted-foreground w-12 text-sm">{config.rows}</span>
						</div>
					</div>

					{/* lock ratio */}
					<div className="space-y-2">
						<Label htmlFor="lockRatio">Lock Ratio</Label>
						<Button
							id="lockRatio"
							variant="outline"
							size="sm"
							onClick={() => updateConfig("lockRatio", !config.lockRatio)}
							className="w-full"
						>
							{config.lockRatio ? "Locked" : "Unlocked"}
						</Button>
					</div>
				</div>
			</div>

			{/* style controls */}
			<div className="space-y-4">
				<h4 className="text-muted-foreground text-sm font-medium">style</h4>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
					{/* circle radius */}
					<div className="space-y-2">
						<Label htmlFor="circleRadius">Circle Radius</Label>
						<div className="flex items-center gap-2">
							<Slider
								id="circleRadius"
								min={0}
								max={MAX_CONFIG_VALUES.circleRadius}
								step={0.01}
								value={[config.circleRadius]}
								onValueChange={(value) => updateConfig("circleRadius", value[0] ?? 0)}
							/>
							<span className="text-muted-foreground w-12 text-sm">{Math.round(config.circleRadius * 100)}%</span>
						</div>
					</div>

					{/* gap */}
					<div className="space-y-2">
						<Label htmlFor="gap">Gap</Label>
						<div className="flex items-center gap-2">
							<Slider
								id="gap"
								min={0}
								max={MAX_CONFIG_VALUES.gap}
								step={1}
								value={[config.gap]}
								onValueChange={(value) => updateConfig("gap", value[0] ?? 0)}
							/>
							<span className="text-muted-foreground w-12 text-sm">{config.gap}</span>
						</div>
					</div>

					{/* border radius */}
					<div className="space-y-2">
						<Label htmlFor="borderRadius">Border Radius</Label>
						<div className="flex items-center gap-2">
							<Slider
								id="borderRadius"
								min={0}
								max={maxBorderRadius}
								step={1}
								value={[config.borderRadius]}
								onValueChange={(value) => updateConfig("borderRadius", value[0] ?? 0)}
							/>
							<span className="text-muted-foreground w-12 text-sm">{config.borderRadius}</span>
						</div>
					</div>
				</div>
			</div>

			{/* color controls */}
			<div className="space-y-4">
				<h4 className="text-muted-foreground text-sm font-medium">colors</h4>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
					{/* brightness */}
					<div className="space-y-2">
						<Label htmlFor="brightness">Brightness</Label>
						<div className="flex items-center gap-2">
							<Slider
								id="brightness"
								min={0}
								max={MAX_CONFIG_VALUES.brightness}
								step={1}
								value={[config.brightness]}
								onValueChange={(value) => updateConfig("brightness", value[0] ?? 100)}
							/>
							<span className="text-muted-foreground w-12 text-sm">{config.brightness}%</span>
						</div>
					</div>

					{/* saturation */}
					<div className="space-y-2">
						<Label htmlFor="saturation">Saturation</Label>
						<div className="flex items-center gap-2">
							<Slider
								id="saturation"
								min={0}
								max={MAX_CONFIG_VALUES.saturation}
								step={1}
								value={[config.saturation]}
								onValueChange={(value) => updateConfig("saturation", value[0] ?? 100)}
							/>
							<span className="text-muted-foreground w-12 text-sm">{config.saturation}%</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
