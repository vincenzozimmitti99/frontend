import TermsOfUse from "~/components/TermsOfUse";
import type { Route } from "./+types/privacy-policy";

export function meta({}) {
	return [
		{ title: "Pull Planner - Terms of Use" },
		{ name: "description", content: "Site to help plan your next characters to pull!" },
		{ property: "og:title", content: `Pull Planner - Terms of Use` },
		{ property: "og:description", content: "Site to help plan your next characters to pull!" }
	];
}

function TermsOfUseRoute({}: Route.ComponentProps) {
	return (
		<TermsOfUse />
	);
}

export default TermsOfUseRoute;