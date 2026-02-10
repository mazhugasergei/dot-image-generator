import { CropperPoint } from "@/components/ui/cropper"

export interface PreviewConfig {
	crop: CropperPoint
	zoom: number
	rotation: number

	cols: number
	rows: number
	lockRatio: boolean
	borderRadius: number
	dotBorderRadius: number
	gap: number

	brightness: number
	saturation: number
}
