"use client"

import { CustomSlider } from "@/components/dot-image-generator/custom-slider"
import { Button } from "@/components/ui/button"
import { Cropper, CropperArea, CropperImage } from "@/components/ui/cropper"
import { PreviewConfig } from "@/types/config"
import { cn } from "@/utils"
import { RotateCcwIcon } from "lucide-react"
import { useCallback, useEffect, useId, useState } from "react"

interface CropperControlledProps {
	imageSrc: string
	config: PreviewConfig
	updateConfig: (value: Partial<PreviewConfig>) => void
	className?: string
}

export function CropperControlled({
	imageSrc,
	config: { crop, zoom, rotation },
	updateConfig,
	className,
}: CropperControlledProps) {
	const id = useId()
	const [aspectRatio, setAspectRatio] = useState(1)

	const onCropReset = useCallback(() => {
		updateConfig({ crop: { x: 0, y: 0 } })
		updateConfig({ zoom: 1 })
		updateConfig({ rotation: 0 })
	}, [updateConfig])

	useEffect(() => {
		if (!imageSrc) return

		const img = new Image()
		img.src = imageSrc
		img.onload = () => {
			setAspectRatio(img.width / img.height)

			// Calculate cropper height based on current cropper width and image aspect ratio
			const cropperElement = document.querySelector('[data-slot="cropper-wrapper"]') as HTMLElement
			if (cropperElement) {
				const cropperWidth = cropperElement.clientWidth
				const calculatedHeight = cropperWidth / aspectRatio
				cropperElement.style.minHeight = `${calculatedHeight}px`
			}
		}
	}, [imageSrc, aspectRatio])

	return (
		<div className={cn("relative flex size-full max-w-lg flex-col overflow-hidden rounded-lg border", className)}>
			<Cropper
				aspectRatio={1}
				crop={crop}
				zoom={zoom}
				rotation={rotation}
				onCropChange={(value) => updateConfig({ crop: value })}
				onZoomChange={(value) => updateConfig({ zoom: value })}
				onRotationChange={(value) => updateConfig({ rotation: value })}
			>
				<CropperImage src={imageSrc} alt="Landscape" crossOrigin="anonymous" />
				<CropperArea />
			</Cropper>
			<div className="flex flex-col items-center gap-4 border-t p-4 sm:flex-row">
				<CustomSlider
					id={`${id}-zoom`}
					label="Zoom"
					value={[zoom]}
					onValueChange={(value) => updateConfig({ zoom: value[0] ?? 1 })}
					min={1}
					max={3}
					step={0.1}
				/>
				<CustomSlider
					id={`${id}-rotation`}
					label="Rotation"
					value={[rotation]}
					onValueChange={(value) => updateConfig({ rotation: value[0] ?? 0 })}
					min={-180}
					max={180}
					step={1}
				/>
			</div>
			<Button variant="outline" size="icon" className="absolute top-3 right-2 size-8" onClick={onCropReset}>
				<RotateCcwIcon />
			</Button>
		</div>
	)
}
