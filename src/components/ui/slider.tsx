"use client"

import { cn } from "@/utils/index"
import { Slider as SliderPrimitive } from "radix-ui"
import { ComponentProps, useMemo } from "react"

function Slider({
	className,
	defaultValue,
	value,
	min = 0,
	max = 100,
	...props
}: ComponentProps<typeof SliderPrimitive.Root>) {
	const _values = useMemo(
		() => (Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max]),
		[value, defaultValue, min, max]
	)

	return (
		<SliderPrimitive.Root
			data-slot="slider"
			defaultValue={defaultValue}
			value={value}
			min={min}
			max={max}
			className={cn(
				"relative flex w-full touch-none items-center overflow-hidden rounded-lg select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
				className
			)}
			{...props}
		>
			<SliderPrimitive.Track
				data-slot="slider-track"
				className={cn(
					"bg-muted relative grow overflow-hidden data-[orientation=horizontal]:h-8 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5"
				)}
			>
				<SliderPrimitive.Range
					data-slot="slider-range"
					className={cn("absolute bg-[#333] data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full")}
				/>
			</SliderPrimitive.Track>
			{Array.from({ length: _values.length }, (_, index) => (
				<SliderPrimitive.Thumb
					data-slot="slider-thumb"
					key={index}
					className="ring-ring/50 block h-4 w-1 shrink-0 -translate-x-1 rounded-full border border-[#222] bg-[#222] shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
				/>
			))}
		</SliderPrimitive.Root>
	)
}

export { Slider }
