import type { Route } from "./+types/settings";
import Settings from "~/components/Settings";

export function meta({}) {
	return [
		{ title: "Pull Planner - Settings" },
		{ name: "description", content: "Plan your gacha pulls across upcoming banners. Very f2p friendly!" },
		{ property: "og:title", content: `Pull Planner - Settings` },
		{ property: "og:description", content: "Plan your gacha pulls across upcoming banners. Very f2p friendly!" }
	];
}

function SettingsRoute({}: Route.ComponentProps) {
	return (
		<Settings></Settings>
	);
}

export default SettingsRoute;