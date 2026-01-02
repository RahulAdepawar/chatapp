// useVisibility.ts
import { useEffect, useState } from "react";

export function useVisibility() {
	const [isVisible, setIsVisible] = useState(!document.hidden);

	useEffect(() => {
		const handleVisibility = () => {
			setIsVisible(!document.hidden);
		};

		document.addEventListener("visibilitychange", handleVisibility);
		return () =>
			document.removeEventListener("visibilitychange", handleVisibility);
	}, []);

	return isVisible;
}
