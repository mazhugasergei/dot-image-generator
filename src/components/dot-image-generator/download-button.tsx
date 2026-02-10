import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/utils"
import { downloadPNG, downloadSVG } from "@/utils/download"
import { Download } from "lucide-react"
import { ComponentProps, useState } from "react"

export function DownloadButton(props: ComponentProps<"div">) {
	const [selectedFormat, setSelectedFormat] = useState<"png" | "svg">("png")

	const handleDownload = async () => {
		try {
			if (selectedFormat === "svg") await downloadSVG()
			else if (selectedFormat === "png") await downloadPNG()
		} catch (error) {
			console.error("Download failed:", error)
		}
	}

	return (
		<div {...props} className={cn("grid grid-cols-[1fr_auto] gap-2", props.className)}>
			<Button variant="default" onClick={handleDownload}>
				<Download className="size-4" />
				Download {selectedFormat.toUpperCase()}
			</Button>

			<Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as "png" | "svg")}>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="svg">SVG</SelectItem>
					<SelectItem value="png">PNG</SelectItem>
				</SelectContent>
			</Select>
		</div>
	)
}
