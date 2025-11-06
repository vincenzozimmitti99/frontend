import PrivacyPolicy from "~/components/PrivacyPolicy";
import type { Route } from "./+types/privacy-policy";

export function meta({}) {
	return [
		{ title: "Pull Planner - Privacy Policy" },
		{ name: "description", content: "Site to help plan your next characters to pull!" },
		{ property: "og:title", content: `Pull Planner - Privacy Policy` },
		{ property: "og:description", content: "Site to help plan your next characters to pull!" }
	];
}

function PrivacyPolicyRoute({}: Route.ComponentProps) {
	return (
		<PrivacyPolicy />
	);
}

export default PrivacyPolicyRoute;