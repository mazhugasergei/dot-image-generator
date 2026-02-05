import type { PreviewConfig } from "@/types/config"

export const DEFAULT_CONFIG: PreviewConfig = {
	cols: 30,
	rows: 30,
	lockRatio: true,
	circleRadius: 1,
	gap: 5,
	borderRadius: 0,
}

export const ELEMENT_SIZE = 30

export const MAX_CONFIG_VALUES: Partial<PreviewConfig> = {
	cols: 80,
	rows: 80,
	circleRadius: 1,
	gap: 50,
	borderRadius: 100,
} as const
