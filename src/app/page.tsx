import { DotImageGenerator } from "@/components/dot-image-generator"
import { SectionWrapper } from "@/components/wrapper"

export default function Home() {
	return (
		<main className="min-h-100dvh grid grid-rows-[auto_1fr_auto]">
			<SectionWrapper className="min-h-6" />
			<SectionWrapper innerClassName="grid place-items-center" className="border-y">
				<DotImageGenerator />
			</SectionWrapper>
			<SectionWrapper className="min-h-6" />
		</main>
	)
}
