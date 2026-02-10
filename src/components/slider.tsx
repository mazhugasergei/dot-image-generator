import { Slider as SliderComponent } from "@/components/ui/slider"

interface CustomSliderProps {
	id: string
	label: string
	value: number[]
	min: number
	max: number
	step: number
	onValueChange: (value: number[]) => void
	onValueCommit?: (value: number[]) => void
}

export function Slider({ id, label, value, min, max, step, onValueChange, onValueCommit }: CustomSliderProps) {
	return (
		<div className="flex w-full flex-col gap-2.5">
			<label htmlFor={id} className="text-sm font-medium">
				{label.split(":").map((part, index) => (
					<span key={index}>
						{part}
						{index === 0 && ": "}
						<span className="text-muted-foreground">
							{value[0]?.toFixed(step < 1 ? 1 : step >= 1 ? 0 : 2)}
							{label.includes("°") ? "°" : label.includes("%") ? "%" : ""}
						</span>
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
					className="flex-1"
				/>
			</div>
		</div>
	)
}
