import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "@/globals.css"
import { mainFont } from "@/lib/fonts"
import { cn } from "@/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Dot Image Generator",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={cn(mainFont.className, "")}>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					{children}
					<Toaster />
				</ThemeProvider>
			</body>
		</html>
	)
}
