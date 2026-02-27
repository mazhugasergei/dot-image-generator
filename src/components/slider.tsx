import { Slider as SliderComponent } from "@/components/ui/slider"
import { ConfigVariant } from "@/types/config"

interface CustomSliderProps {
	id: string
	label: string
	value: number[]
	min: number
	max: number
	step: number
	onValueChange: (value: number[]) => void
	onValueCommit?: (value: number[]) => void
	variant?: ConfigVariant
}

export function Slider({
	id,
	label,
	value,
	min,
	max,
	step,
	onValueChange,
	onValueCommit,
	variant = "default",
}: CustomSliderProps) {
	return (
		<div className="relative isolate flex w-full flex-col gap-2.5">
			<label
				htmlFor={id}
				className="text-secondary-foreground pointer-events-none absolute top-1/2 right-3 left-3 z-1 -translate-y-1/2 text-sm font-medium"
			>
				{label.split(":").map((part, index) => (
					<span key={index} className="flex items-center justify-between gap-2">
						<span>{part}</span>
						<span>{value[0]?.toFixed(step < 1 ? 1 : step >= 1 ? 0 : 2)}</span>
					</span>
				))}
			</label>
			<div className="flex items-center gap-2">
				<SliderComponent
					id={id}
					value={value}
					onValueChange={onValueChange}
					onValueCommit={onValueCommit}
					min={min}
					max={max}
					step={step}
					variant={variant}
				/>
			</div>
		</div>
	)
}
