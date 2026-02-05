import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download } from "lucide-react"

interface DownloadButtonProps {
	onDownload: (format: "png" | "svg") => Promise<void>
	disabled?: boolean
}

export function DownloadButton({ onDownload, disabled = false }: DownloadButtonProps) {
	const handleDownload = async (format: "png" | "svg") => {
		try {
			await onDownload(format)
		} catch (error) {
			console.error("Download failed:", error)
		}
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="default" disabled={disabled}>
					<Download className="h-4 w-4" />
					Download
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent side="top">
				<DropdownMenuItem onClick={() => handleDownload("svg")}>Download as SVG</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleDownload("png")}>Download as PNG</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
