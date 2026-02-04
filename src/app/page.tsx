import { FileUpload } from "@/components/file-upload"
import { SectionWrapper } from "@/components/wrapper"

export default function Home() {
	return (
		<main className="min-h-100dvh grid grid-rows-[auto_1fr_auto]">
			<SectionWrapper className="min-h-6" />
			<SectionWrapper innerClassName="flex flex-col items-center" className="border-y">
				<FileUpload />
			</SectionWrapper>
			<SectionWrapper className="min-h-6" />
		</main>
	)
}
