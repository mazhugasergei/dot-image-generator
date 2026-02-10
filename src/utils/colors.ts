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

// helper function to convert any color format to hex
export function toHex(colorString: string): string {
	const { color } = parseColorAndOpacity(colorString)

	// if already hex, return as is
	if (color.startsWith("#")) {
		return color
	}

	// parse RGB format
	const rgbMatch = color.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
	if (rgbMatch) {
		const toHex = (n: string) => {
			const hex = Number.parseInt(n).toString(16)
			return hex.length === 1 ? `0${hex}` : hex
		}
		return `#${toHex(rgbMatch[1])}${toHex(rgbMatch[2])}${toHex(rgbMatch[3])}`
	}

	// parse HSL format
	const hslMatch = color.match(/^hsl\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/)
	if (hslMatch) {
		const h = Number.parseInt(hslMatch[1]) / 360
		const s = Number.parseInt(hslMatch[2]) / 100
		const l = Number.parseInt(hslMatch[3]) / 100

		const c = (1 - Math.abs(2 * l - 1)) * s
		const x = c * (1 - Math.abs(((h * 6) % 2) - 1))
		const m = l - c / 2

		let r = 0,
			g = 0,
			b = 0

		if (h >= 0 && h < 1 / 6) {
			r = c
			g = x
			b = 0
		} else if (h >= 1 / 6 && h < 2 / 6) {
			r = x
			g = c
			b = 0
		} else if (h >= 2 / 6 && h < 3 / 6) {
			r = 0
			g = c
			b = x
		} else if (h >= 3 / 6 && h < 4 / 6) {
			r = 0
			g = x
			b = c
		} else if (h >= 4 / 6 && h < 5 / 6) {
			r = x
			g = 0
			b = c
		} else if (h >= 5 / 6 && h < 1) {
			r = c
			g = 0
			b = x
		}

		const finalR = Math.round((r + m) * 255)
		const finalG = Math.round((g + m) * 255)
		const finalB = Math.round((b + m) * 255)

		return `#${finalR.toString(16).padStart(2, "0")}${finalG.toString(16).padStart(2, "0")}${finalB.toString(16).padStart(2, "0")}`
	}

	// parse HSB format
	const hsbMatch = color.match(/^hsb\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/)
	if (hsbMatch) {
		const h = Number.parseInt(hsbMatch[1]) / 360
		const s = Number.parseInt(hsbMatch[2]) / 100
		const v = Number.parseInt(hsbMatch[3]) / 100

		const i = Math.floor(h * 6)
		const f = h * 6 - i
		const p = v * (1 - s)
		const q = v * (1 - f * s)
		const t = v * (1 - (1 - f) * s)

		let r = 0,
			g = 0,
			b = 0

		switch (i % 6) {
			case 0:
				r = v
				g = t
				b = p
				break
			case 1:
				r = q
				g = v
				b = p
				break
			case 2:
				r = p
				g = v
				b = t
				break
			case 3:
				r = p
				g = q
				b = v
				break
			case 4:
				r = t
				g = p
				b = v
				break
			case 5:
				r = v
				g = p
				b = q
				break
		}

		const toHex = (n: number) => {
			const hex = Math.round(n * 255).toString(16)
			return hex.length === 1 ? `0${hex}` : hex
		}

		return `#${toHex(r)}${toHex(g)}${toHex(b)}`
	}

	// fallback to original
	return color
}

// helper function to parse color string and extract opacity
export function parseColorAndOpacity(colorString: string): { color: string; opacity: number } {
	// handle rgba/hsla colors
	const rgbaMatch = colorString.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+))?\s*\)$/)
	if (rgbaMatch) {
		const opacity = rgbaMatch[4] ? Number.parseFloat(rgbaMatch[4]) : 1
		const color = `rgb(${rgbaMatch[1]}, ${rgbaMatch[2]}, ${rgbaMatch[3]})`
		return { color, opacity }
	}

	// handle hsl/hsla colors
	const hslaMatch = colorString.match(/^hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)$/)
	if (hslaMatch) {
		const opacity = hslaMatch[4] ? Number.parseFloat(hslaMatch[4]) : 1
		const color = `hsl(${hslaMatch[1]}, ${hslaMatch[2]}%, ${hslaMatch[3]}%)`
		return { color, opacity }
	}

	// handle hsb/hsba colors
	const hsbMatch = colorString.match(/^hsba?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*(?:,\s*([\d.]+))?\s*\)$/)
	if (hsbMatch) {
		const opacity = hsbMatch[4] ? Number.parseFloat(hsbMatch[4]) : 1
		const color = `hsb(${hsbMatch[1]}, ${hsbMatch[2]}%, ${hsbMatch[3]}%)`
		return { color, opacity }
	}

	// handle hex colors (including 8-digit hex with alpha)
	const hexMatch = colorString.match(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{8})$/)
	if (hexMatch) {
		if (hexMatch[1].length === 8) {
			// 8-digit hex with alpha
			const r = colorString.substring(1, 3)
			const g = colorString.substring(3, 5)
			const b = colorString.substring(5, 7)
			const a = Number.parseInt(colorString.substring(7, 9), 16) / 255
			return { color: `#${r}${g}${b}`, opacity: a }
		} else {
			// 6-digit hex without alpha
			return { color: colorString, opacity: 1 }
		}
	}

	// handle 3-digit hex colors
	const hex3Match = colorString.match(/^#([a-fA-F0-9]{3})$/)
	if (hex3Match) {
		return { color: colorString, opacity: 1 }
	}

	// fallback
	return { color: colorString, opacity: 1 }
}
