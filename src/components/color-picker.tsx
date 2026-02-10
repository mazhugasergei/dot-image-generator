import {
	ColorPickerAlphaSlider,
	ColorPickerArea,
	ColorPicker as ColorPickerComponent,
	ColorPickerContent,
	ColorPickerEyeDropper,
	ColorPickerFormatSelect,
	ColorPickerHueSlider,
	ColorPickerInput,
	ColorPickerSwatch,
	ColorPickerTrigger,
} from "@/components/ui/color-picker"
import { ComponentProps } from "react"

export function ColorPicker({ value, onValueChange, ...props }: ComponentProps<typeof ColorPickerComponent>) {
	return (
		<ColorPickerComponent value={value} onValueChange={onValueChange} {...props}>
			<ColorPickerTrigger asChild>
				<ColorPickerSwatch className="w-full" />
			</ColorPickerTrigger>
			<ColorPickerContent>
				<ColorPickerArea />
				<ColorPickerEyeDropper />
				<ColorPickerHueSlider />
				<ColorPickerAlphaSlider />
				<ColorPickerFormatSelect />
				<ColorPickerInput />
			</ColorPickerContent>
		</ColorPickerComponent>
	)
}
