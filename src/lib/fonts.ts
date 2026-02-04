import { Montserrat as LogoFont, Inter as MainFont } from "next/font/google"

export const mainFont = MainFont({ subsets: ["latin", "cyrillic"] })
export const logoFont = LogoFont({ subsets: ["latin"], weight: "400" })
