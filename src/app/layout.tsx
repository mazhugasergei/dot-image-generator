import { ThemeProvider } from "@/components/theme-provider"
import "@/globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
	title: "Dot Image Generator",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}
