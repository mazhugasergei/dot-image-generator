import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download } from "lucide-react"

interface Props extends React.ComponentProps<typeof Button> {
	onDownload: (format: "png" | "svg") => Promise<void>
	disabled?: boolean
}

export function DownloadButton({ onDownload, disabled = false, ...props }: Props) {
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
				<Button variant="default" disabled={disabled} {...props}>
					<Download className="size-4" />
					Download
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent>
				<DropdownMenuItem onClick={() => handleDownload("svg")}>Save as SVG</DropdownMenuItem>
				<DropdownMenuItem onClick={() => handleDownload("png")}>Save as PNG</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
