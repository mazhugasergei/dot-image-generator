import { HeartIcon } from "lucide-react"

export function Footer() {
	return (
		<footer className="text-muted-foreground text-center text-sm">
			Made with <HeartIcon className="fill-foreground text-foreground mx-1 inline-block size-4" /> by{" "}
			<a
				href="https://github.com/mazhugasergei"
				target="_blank"
				rel="noopener noreferrer"
				className="text-foreground font-medium underline"
			>
				mazhugasergei
			</a>
		</footer>
	)
}
