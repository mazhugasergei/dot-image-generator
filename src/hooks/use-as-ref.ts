import { useIsomorphicLayoutEffect } from "@/hooks/use-isomorphic-layout-effect"
import { useRef } from "react"

function useAsRef<T>(props: T) {
	const ref = useRef<T>(props)

	useIsomorphicLayoutEffect(() => {
		ref.current = props
	})

	return ref
}

export { useAsRef }
