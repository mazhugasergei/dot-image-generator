"use client"

import { Button } from "@/components/ui/button"
import {
	FileUpload as FileUploadComponent,
	FileUploadDropzone,
	FileUploadItem,
	FileUploadItemDelete,
	FileUploadItemMetadata,
	FileUploadItemPreview,
	FileUploadList,
	FileUploadTrigger,
} from "@/components/ui/file-upload"
import { cn } from "@/utils"
import { Upload, X } from "lucide-react"
import { ComponentProps, useCallback } from "react"

import { toast } from "sonner"

interface Props extends ComponentProps<typeof FileUploadComponent> {
	files: File[]
	onFilesChange: (files: File[]) => void
}

export function FileUpload({ files, onFilesChange, className, ...props }: Props) {
	const onFileValidate = useCallback(
		(file: File): string | null => {
			// Validate max files
			if (files.length >= 1) {
				return "You can only upload up to 1 file"
			}

			// Validate file type (only images)
			if (!file.type.startsWith("image/")) {
				return "Only image files are allowed"
			}

			// Validate file size
			const MAX_SIZE = 5 * 1024 * 1024 // 5MB
			if (file.size > MAX_SIZE) {
				return `File size must be less than ${MAX_SIZE / (1024 * 1024)}MB`
			}

			return null
		},
		[files]
	)

	const onFileReject = useCallback((file: File, message: string) => {
		toast(message, {
			description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`,
		})
	}, [])

	return (
		<FileUploadComponent
			value={files}
			onValueChange={onFilesChange}
			onFileValidate={onFileValidate}
			onFileReject={onFileReject}
			accept="image/*"
			maxFiles={1}
			className={cn("w-full", className)}
			{...props}
		>
			{!files.length && (
				<FileUploadDropzone>
					<div className="flex flex-col items-center gap-1">
						<div className="flex items-center justify-center rounded-full border p-2.5">
							<Upload className="text-muted-foreground size-6" />
						</div>
						<p className="text-sm font-medium">Drag & drop an image here</p>
						<p className="text-muted-foreground text-xs">Or click to browse</p>
					</div>
					<FileUploadTrigger asChild>
						<Button variant="outline" size="sm" className="mt-2 w-fit">
							Browse files
						</Button>
					</FileUploadTrigger>
				</FileUploadDropzone>
			)}

			<FileUploadList>
				{files.map((file) => (
					<FileUploadItem key={file.name} value={file}>
						<FileUploadItemPreview />
						<FileUploadItemMetadata />
						<FileUploadItemDelete asChild>
							<Button variant="ghost" size="icon" className="size-7">
								<X />
							</Button>
						</FileUploadItemDelete>
					</FileUploadItem>
				))}
			</FileUploadList>
		</FileUploadComponent>
	)
}
