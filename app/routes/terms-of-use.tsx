import TermsOfUse from "~/components/TermsOfUse";
import type { Route } from "./+types/privacy-policy";

export function meta({}) {
	return [
		{ title: "Pull Planner - Terms of Use" },
		{ name: "description", content: "Plan your gacha pulls across upcoming banners. Very f2p friendly!" },
		{ property: "og:title", content: `Pull Planner - Terms of Use` },
		{ property: "og:description", content: "Plan your gacha pulls across upcoming banners. Very f2p friendly!" }
	];
}

function TermsOfUseRoute({}: Route.ComponentProps) {
	return (
		<TermsOfUse />
	);
}

export default TermsOfUseRoute;