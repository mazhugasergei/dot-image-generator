"use client"

import { ColorPicker } from "@/components/color-picker"
import { Slider } from "@/components/slider"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DEFAULT_CONFIG, MAX_CONFIG_VALUES, MIN_CONFIG_VALUES } from "@/lib/constants"
import type { PreviewConfig } from "@/types/config"
import { cn } from "@/utils"
import { LockIcon, LockOpenIcon, RotateCcwIcon } from "lucide-react"
import { ComponentProps, useRef } from "react"

interface SectionProps extends ComponentProps<"div"> {
	title: string
	onReset: () => void
	children: React.ReactNode
}

function Section({ title, onReset, children, className, ...props }: SectionProps) {
	return (
		<div className={cn("relative space-y-4 p-4 pt-3 not-first:border-t", className)} {...props}>
			<div className="flex items-center justify-between">
				<h4 className="text-muted-foreground text-sm font-medium">{title}</h4>
				<Button
					variant="outline"
					size="sm"
					onClick={onReset}
					className="border-border! text-muted-foreground absolute -top-0.25 -right-0.25 rounded-none bg-transparent!"
				>
					<RotateCcwIcon /> Reset
				</Button>
			</div>
			<div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">{children}</div>
		</div>
	)
}

export interface Props extends ComponentProps<"div"> {
	config: PreviewConfig
	updateConfig: (value: Partial<PreviewConfig>) => void
	maxBorderRadius: number
}

export function ConfigControls({ config, updateConfig, maxBorderRadius, className, ...props }: Props) {
	const lastValues = useRef({ cols: config.cols, rows: config.rows })

	return (
		<div className={cn("w-full", className)} {...props}>
			{/* transformation controls */}
			<Section title="Transform" onReset={() => updateConfig({ crop: { x: 0, y: 0 }, zoom: 1, rotation: 0 })}>
				{/* position X */}
				<div className="space-y-2">
					<Slider
						id="positionX"
						label="Position X"
						min={MIN_CONFIG_VALUES.crop.x}
						max={MAX_CONFIG_VALUES.crop.x}
						step={1}
						value={[config.crop.x]}
						onValueChange={(value) => updateConfig({ crop: { ...config.crop, x: value[0] ?? 0 } })}
					/>
				</div>

				{/* position Y */}
				<div className="space-y-2">
					<Slider
						id="positionY"
						label="Position Y"
						min={MIN_CONFIG_VALUES.crop.y}
						max={MAX_CONFIG_VALUES.crop.y}
						step={1}
						value={[config.crop.y]}
						onValueChange={(value) => updateConfig({ crop: { ...config.crop, y: value[0] ?? 0 } })}
					/>
				</div>

				{/* zoom */}
				<div className="space-y-2">
					<Slider
						id="zoom"
						label="Zoom"
						min={MIN_CONFIG_VALUES.zoom}
						max={MAX_CONFIG_VALUES.zoom}
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
						min={MIN_CONFIG_VALUES.rotation}
						max={MAX_CONFIG_VALUES.rotation}
						step={1}
						value={[config.rotation]}
						onValueChange={(value) => updateConfig({ rotation: value[0] ?? 0 })}
					/>
				</div>
			</Section>

			{/* layout controls */}
			<Section
				title="Layout"
				onReset={() =>
					updateConfig({ cols: DEFAULT_CONFIG.cols, rows: DEFAULT_CONFIG.rows, ratio: DEFAULT_CONFIG.ratio })
				}
			>
				{/* columns */}
				<div className="flex w-full flex-col gap-2.5">
					<Slider
						id="cols"
						label="Columns"
						min={MIN_CONFIG_VALUES.cols}
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
						min={MIN_CONFIG_VALUES.rows}
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
					<Label htmlFor="ratio">Lock ratio</Label>
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
			</Section>

			{/* style controls */}
			<Section
				title="Style"
				onReset={() =>
					updateConfig({
						borderRadius: DEFAULT_CONFIG.borderRadius,
						dotBorderRadius: DEFAULT_CONFIG.dotBorderRadius,
						gap: DEFAULT_CONFIG.gap,
					})
				}
			>
				{/* border radius */}
				<div className="space-y-2">
					<Slider
						id="borderRadius"
						label="Image round"
						min={MIN_CONFIG_VALUES.borderRadius}
						max={MAX_CONFIG_VALUES.borderRadius}
						step={0.01}
						value={[config.borderRadius]}
						onValueChange={(value) => updateConfig({ borderRadius: value[0] ?? 0 })}
					/>
				</div>

				{/* dot border radius */}
				<div className="space-y-2">
					<Slider
						id="dotBorderRadius"
						label="Dot round"
						min={MIN_CONFIG_VALUES.dotBorderRadius}
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
						label="Dot gap"
						min={MIN_CONFIG_VALUES.gap}
						max={MAX_CONFIG_VALUES.gap}
						step={1}
						value={[config.gap]}
						onValueChange={(value) => updateConfig({ gap: value[0] ?? 0 })}
					/>
				</div>
			</Section>

			{/* color filters */}
			<Section
				title="Filters"
				onReset={() =>
					updateConfig({
						brightness: DEFAULT_CONFIG.brightness,
						saturation: DEFAULT_CONFIG.saturation,
						contrast: DEFAULT_CONFIG.contrast,
					})
				}
			>
				{/* brightness */}
				<div className="space-y-2">
					<Slider
						id="brightness"
						label="Brightness"
						min={MIN_CONFIG_VALUES.brightness}
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
						min={MIN_CONFIG_VALUES.saturation}
						max={MAX_CONFIG_VALUES.saturation}
						step={1}
						value={[config.saturation]}
						onValueChange={(value) => updateConfig({ saturation: value[0] ?? 100 })}
					/>
				</div>

				{/* contrast */}
				<div className="space-y-2">
					<Slider
						id="contrast"
						label="Contrast"
						min={MIN_CONFIG_VALUES.contrast}
						max={MAX_CONFIG_VALUES.contrast}
						step={1}
						value={[config.contrast]}
						onValueChange={(value) => updateConfig({ contrast: value[0] ?? 100 })}
					/>
				</div>
			</Section>

			{/* background controls */}
			<Section
				title="Background"
				onReset={() =>
					updateConfig({
						backgroundEnabled: DEFAULT_CONFIG.backgroundEnabled,
						backgroundColor: DEFAULT_CONFIG.backgroundColor,
						backgroundRoundness: DEFAULT_CONFIG.backgroundRoundness,
					})
				}
			>
				{/* bg toggle */}
				<div className="space-y-2">
					<Label htmlFor="backgroundToggle">Enable</Label>
					<Select
						value={config.backgroundEnabled ? "enabled" : "disabled"}
						onValueChange={(value) =>
							updateConfig({
								backgroundEnabled: value === "enabled",
							})
						}
					>
						<SelectTrigger size="sm" className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="enabled">Enabled</SelectItem>
							<SelectItem value="disabled">Disabled</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* bg color */}
				<div className="space-y-2">
					<Label htmlFor="backgroundColor">Color</Label>
					<ColorPicker
						id="backgroundColor"
						value={config.backgroundColor}
						onValueChange={(value) => updateConfig({ backgroundColor: value })}
						disabled={!config.backgroundEnabled}
					/>
				</div>

				{/* bg roundness */}
				<div className="space-y-2">
					<Label htmlFor="backgroundRoundness">Roundness</Label>
					<Select
						value={config.backgroundRoundness}
						onValueChange={(value) => updateConfig({ backgroundRoundness: value as "none" | "inherit" })}
						disabled={!config.backgroundEnabled}
					>
						<SelectTrigger size="sm" className="w-full">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="none">None</SelectItem>
							<SelectItem value="inherit">Inherit</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</Section>
		</div>
	)
}
