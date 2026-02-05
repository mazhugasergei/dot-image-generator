import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface PreviewConfig {
	cols: number
	rows: number
	lockRatio: boolean
	circleRadius: number
	gap: number
	borderRadius: number // CSS px
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
		circleRadius: 15,
		gap: 10,
		borderRadius: 0,
	}

	const handleReset = () => {
		Object.entries(defaultConfig).forEach(([key, value]) => {
			updateConfig(key as keyof PreviewConfig, value)
		})
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
				<div className="space-y-2">
					<Label htmlFor="cols">Columns</Label>
					<Input
						id="cols"
						type="number"
						min="1"
						max="1000"
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
						max="1000"
						value={config.rows}
						onChange={(e) => updateConfig("rows", parseInt(e.target.value) || 1)}
					/>
				</div>

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

				<div className="space-y-2">
					<Label htmlFor="circleRadius">Circle Radius</Label>
					<Input
						id="circleRadius"
						type="number"
						min="1"
						max="1000"
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
						max="1000"
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
						max={maxBorderRadius}
						value={config.borderRadius}
						onChange={(e) => updateConfig("borderRadius", parseInt(e.target.value) || 0)}
					/>
				</div>
			</div>
		</div>
	)
}
