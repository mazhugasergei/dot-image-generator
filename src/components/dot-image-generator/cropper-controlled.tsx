"use client"

import { Button } from "@/components/ui/button"
import { Cropper, CropperArea, CropperImage, type CropperPoint } from "@/components/ui/cropper"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/utils"
import { RotateCcwIcon } from "lucide-react"
import React from "react"

interface CropperControlledProps {
	imageSrc?: string
	className?: string
}

export function CropperControlled({ imageSrc, className }: CropperControlledProps) {
	const id = React.useId()
	const [crop, setCrop] = React.useState<CropperPoint>({ x: 0, y: 0 })
	const [zoom, setZoom] = React.useState(1)
	const [rotation, setRotation] = React.useState(0)

	const onCropReset = React.useCallback(() => {
		setCrop({ x: 0, y: 0 })
		setZoom(1)
		setRotation(0)
	}, [])

	return (
		<div className={cn("relative flex size-full max-w-lg flex-col overflow-hidden rounded-lg border", className)}>
			<Cropper
				aspectRatio={1}
				crop={crop}
				zoom={zoom}
				rotation={rotation}
				onCropChange={setCrop}
				onZoomChange={setZoom}
				onRotationChange={setRotation}
				className="min-h-[260px]"
			>
				<CropperImage
					src={
						imageSrc ||
						"https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=80"
					}
					alt="Landscape"
					crossOrigin="anonymous"
				/>
				<CropperArea />
			</Cropper>
			<div className="flex flex-col items-center gap-4 border-t p-4 sm:flex-row">
				<div className="flex w-full flex-col gap-2.5">
					<Label htmlFor={`${id}-zoom`}>Zoom: {zoom.toFixed(2)}</Label>
					<Slider
						id={`${id}-zoom`}
						value={[zoom]}
						onValueChange={(value) => setZoom(value[0] ?? 1)}
						min={1}
						max={3}
						step={0.1}
					/>
				</div>
				<div className="flex w-full flex-col gap-2.5">
					<Label htmlFor={`${id}-rotation`}>Rotation: {rotation.toFixed(0)}°</Label>
					<Slider
						id={`${id}-rotation`}
						value={[rotation]}
						onValueChange={(value) => setRotation(value[0] ?? 0)}
						min={-180}
						max={180}
						step={1}
					/>
				</div>
			</div>
			<Button variant="outline" size="icon" className="absolute top-3 right-2 size-8" onClick={onCropReset}>
				<RotateCcwIcon />
			</Button>
		</div>
	)
}
