import PrivacyPolicy from "~/components/PrivacyPolicy";
import type { Route } from "./+types/privacy-policy";

export function meta({}) {
	return [
		{ title: "Pull Planner - Privacy Policy" },
		{ name: "description", content: "Plan your gacha pulls across upcoming banners. Very f2p friendly!" },
		{ property: "og:title", content: `Pull Planner - Privacy Policy` },
		{ property: "og:description", content: "Plan your gacha pulls across upcoming banners. Very f2p friendly!" }
	];
}

function PrivacyPolicyRoute({}: Route.ComponentProps) {
	return (
		<PrivacyPolicy />
	);
}

export default PrivacyPolicyRoute;