import { DotImageGenerator } from "@/components/dot-image-generator"
import { Footer } from "@/components/footer"
import { SectionWrapper } from "@/components/wrapper"

export default function Home() {
	return (
		<main className="min-h-100dvh grid grid-rows-[auto_1fr_auto]">
			<SectionWrapper className="min-h-6" />
			<SectionWrapper
				innerClassName="flex flex-col justify-center items-center py-10 lg:p-10 xl:px-16"
				className="border-y"
			>
				<h1 className="text-center text-3xl font-bold text-balance">Dot Image Generator</h1>
				<p className="text-muted-foreground mt-2 text-center text-sm text-balance">
					Upload an image to generate a dot art version of it
				</p>
				<DotImageGenerator className="mt-10" />
			</SectionWrapper>
			<SectionWrapper className="min-h-6">
				<Footer />
			</SectionWrapper>
		</main>
	)
}
