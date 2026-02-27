"use client"

import type { ConfigVariant } from "@/types/config"
import { cn } from "@/utils/index"
import { Slider as SliderPrimitive } from "radix-ui"
import { ComponentProps, useMemo } from "react"

interface SliderProps extends ComponentProps<typeof SliderPrimitive.Root> {
	variant?: ConfigVariant
}

function Slider({ className, defaultValue, value, min = 0, max = 100, variant = "default", ...props }: SliderProps) {
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
					"relative grow overflow-hidden data-[orientation=horizontal]:h-8 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1.5",
					variant === "default" && "bg-[#191919]",
					variant === "secondary" && "bg-muted"
				)}
			>
				<SliderPrimitive.Range
					data-slot="slider-range"
					className={cn(
						"absolute data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
						variant === "default" && "bg-[#262626]",
						variant === "secondary" && "bg-[#333]"
					)}
				/>
			</SliderPrimitive.Track>
			{Array.from({ length: _values.length }, (_, index) => (
				<SliderPrimitive.Thumb
					data-slot="slider-thumb"
					key={index}
					className={cn(
						"ring-ring/50 block h-4 w-1 shrink-0 -translate-x-1 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50",
						variant === "default" && "border-[#151515] bg-[#151515]",
						variant === "secondary" && "border-[#222] bg-[#222]"
					)}
				/>
			))}
		</SliderPrimitive.Root>
	)
}

export { Slider }
