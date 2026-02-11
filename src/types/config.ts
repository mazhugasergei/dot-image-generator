export interface PreviewConfig {
	crop: { x: number; y: number }
	zoom: number
	rotation: number

	cols: number
	rows: number
	ratio: number | null
	borderRadius: number
	dotBorderRadius: number
	gap: number

	brightness: number
	saturation: number
	contrast: number
	backgroundEnabled: boolean
	backgroundColor: string
	backgroundRoundness: "none" | "inherit"
}
