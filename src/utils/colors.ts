export function applyColorAdjustments(
	r: number,
	g: number,
	b: number,
	brightness: number,
	saturation: number
): [number, number, number] {
	// apply brightness (0-200%)
	const brightnessFactor = brightness / 100
	r = Math.min(255, Math.max(0, r * brightnessFactor))
	g = Math.min(255, Math.max(0, g * brightnessFactor))
	b = Math.min(255, Math.max(0, b * brightnessFactor))

	// apply saturation (0-200%)
	const gray = 0.2989 * r + 0.587 * g + 0.114 * b
	const saturationFactor = saturation / 100
	r = Math.min(255, Math.max(0, gray + saturationFactor * (r - gray)))
	g = Math.min(255, Math.max(0, gray + saturationFactor * (g - gray)))
	b = Math.min(255, Math.max(0, gray + saturationFactor * (b - gray)))

	return [Math.round(r), Math.round(g), Math.round(b)]
}
