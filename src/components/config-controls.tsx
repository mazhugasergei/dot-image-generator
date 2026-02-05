"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useRef } from "react"

export interface PreviewConfig {
	cols: number
	rows: number
	lockRatio: boolean
	circleRadius: number
	gap: number
	borderRadius: number
}

export interface ConfigControlsProps {
	config: PreviewConfig
	updateConfig: (key: keyof PreviewConfig, value: number | boolean) => void
	maxBorderRadius: number
	onReset?: () => void
}

export function ConfigControls({ config, updateConfig, maxBorderRadius, onReset }: ConfigControlsProps) {
	const defaultConfig: PreviewConfig = {
		cols: 10,
		rows: 10,
		lockRatio: true,
		circleRadius: 0.5,
		gap: 10,
		borderRadius: 0,
	}

	const lastValues = useRef({ cols: config.cols, rows: config.rows })

	const handleReset = () => {
		Object.entries(defaultConfig).forEach(([key, value]) => updateConfig(key as keyof PreviewConfig, value))
		lastValues.current = { cols: defaultConfig.cols, rows: defaultConfig.rows }
		onReset?.()
	}

	return (
		<div className="w-full space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-medium">Configuration</h3>
				<Button variant="outline" size="sm" onClick={handleReset}>
					Reset
				</Button>
			</div>

			<div className="grid grid-cols-2 gap-4 md:grid-cols-3">
				{/* Columns */}
				<div className="space-y-2">
					<Label htmlFor="cols">Columns</Label>
					<div className="flex items-center gap-2">
						<Slider
							id="cols"
							min={1}
							max={100}
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

				{/* Rows */}
				<div className="space-y-2">
					<Label htmlFor="rows">Rows</Label>
					<div className="flex items-center gap-2">
						<Slider
							id="rows"
							min={1}
							max={100}
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

				{/* Lock Ratio */}
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

				{/* Circle Radius */}
				<div className="space-y-2">
					<Label htmlFor="circleRadius">Circle Radius</Label>
					<div className="flex items-center gap-2">
						<Slider
							id="circleRadius"
							min={0}
							max={1}
							step={0.01}
							value={[config.circleRadius]}
							onValueChange={(value) => updateConfig("circleRadius", value[0] ?? 0)}
						/>
						<span className="text-muted-foreground w-12 text-sm">{Math.round(config.circleRadius * 100)}%</span>
					</div>
				</div>

				{/* Gap */}
				<div className="space-y-2">
					<Label htmlFor="gap">Gap</Label>
					<div className="flex items-center gap-2">
						<Slider
							id="gap"
							min={0}
							max={100}
							step={1}
							value={[config.gap]}
							onValueChange={(value) => updateConfig("gap", value[0] ?? 0)}
						/>
						<span className="text-muted-foreground w-12 text-sm">{config.gap}</span>
					</div>
				</div>

				{/* Border Radius */}
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
	)
}
