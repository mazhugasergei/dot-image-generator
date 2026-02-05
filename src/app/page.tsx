import { DotImageGenerator } from "@/components/dot-image-generator"
import { Footer } from "@/components/footer"
import { SectionWrapper } from "@/components/wrapper"

export default function Home() {
	return (
		<main className="min-h-100dvh grid grid-rows-[auto_1fr_auto]">
			<SectionWrapper className="min-h-6" />
			<SectionWrapper innerClassName="flex flex-col items-center py-10" className="border-y">
				<h1 className="text-3xl leading-14 font-bold">Dot Image Generator</h1>
				<p className="text-muted-foreground text-sm">Upload an image to generate a dot art version of it</p>
				<DotImageGenerator className="mt-10" />
			</SectionWrapper>
			<SectionWrapper className="min-h-6">
				<Footer />
			</SectionWrapper>
		</main>
	)
}
