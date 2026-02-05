"use client"

import { FileUpload } from "@/components/file-upload"
import { Preview } from "@/components/preview"
import { cn } from "@/utils"
import React from "react"

interface Props {
	className?: string
}

export function DotImageGenerator({ className }: Props) {
	const [files, setFiles] = React.useState<File[]>([])
	const [imageUrls, setImageUrls] = React.useState<string[]>([])

	React.useEffect(() => {
		console.log(files)

		// Create URLs for image previews
		const urls = files.map((file) => URL.createObjectURL(file))
		setImageUrls(urls)

		// Cleanup function to revoke object URLs
		return () => {
			urls.forEach((url) => URL.revokeObjectURL(url))
		}
	}, [files])

	return (
		<div className={cn("space-y-4", className)}>
			<FileUpload files={files} onFilesChange={setFiles} />
			{files.length > 0 && <Preview src={imageUrls[0]} alt={files[0].name} />}
		</div>
	)
}
