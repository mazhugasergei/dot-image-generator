import type { PreviewConfig } from "@/types/config"

export const DOT_SIZE = 30

export const DEFAULT_CONFIG: PreviewConfig = {
	crop: { x: 0, y: 0 },
	zoom: 1,
	rotation: 0,

	cols: 30,
	rows: 30,
	ratio: 1,
	gap: 2,
	borderRadius: 0,
	dotBorderRadius: 1,

	brightness: 100,
	saturation: 100,
	contrast: 100,

	backgroundEnabled: false,
	backgroundColor: "#000000",
	backgroundRoundness: "inherit",
}

export const MIN_CONFIG_VALUES: Omit<
	PreviewConfig,
	"ratio" | "backgroundEnabled" | "backgroundColor" | "backgroundRoundness"
> = {
	crop: { x: -100, y: -100 },
	zoom: 0.5,
	rotation: -180,

	cols: 1,
	rows: 1,
	borderRadius: 0,
	dotBorderRadius: 0,
	gap: 0,

	brightness: 0,
	saturation: 0,
	contrast: 0,
} as const

export const MAX_CONFIG_VALUES: Omit<
	PreviewConfig,
	"ratio" | "backgroundEnabled" | "backgroundColor" | "backgroundRoundness"
> = {
	crop: { x: 100, y: 100 },
	zoom: 3,
	rotation: 360,

	cols: 80,
	rows: 80,
	borderRadius: 1,
	dotBorderRadius: 1,
	gap: 20,

	brightness: 200,
	saturation: 200,
	contrast: 200,
} as const
