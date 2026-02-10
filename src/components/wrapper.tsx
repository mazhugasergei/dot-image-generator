import { cn } from "@/utils"
import { ComponentProps, CSSProperties } from "react"

interface Props extends ComponentProps<"div"> {
	innerStyle?: CSSProperties
	innerClassName?: string
}

export const SectionWrapper = ({ children, className, innerStyle, innerClassName, ...props }: Props) => {
	return (
		<div className={cn("grid md:px-3", className)} {...props}>
			<Wrapper style={innerStyle} className={cn("bg-background p-4 md:border-x", innerClassName)}>
				{children}
			</Wrapper>
		</div>
	)
}

export function Wrapper({ children, className, ...props }: ComponentProps<"div">) {
	return (
		<div className={cn("mx-auto h-full w-full max-w-7xl", className)} {...props}>
			{children}
		</div>
	)
}
