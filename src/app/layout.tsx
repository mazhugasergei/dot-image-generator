import border_img from "@/assets/images/lines.svg"
import "@/assets/styles/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { mainFont } from "@/lib/fonts"
import { cn } from "@/utils"
import type { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
	title: "Dot Image Generator",
}

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn(mainFont.className, "")}>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					<BG />
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}

export function BG() {
	return (
		<div
			style={{
				position: "fixed",
				inset: 0,
				backgroundImage: `url(${border_img.src})`,
				backgroundSize: "4rem",
				zIndex: -1,
				opacity: 0.1,
			}}
		/>
	)
}
