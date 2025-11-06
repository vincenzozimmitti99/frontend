import type { Route } from "./+types/settings";
import Settings from "~/components/Settings";

export function meta({}) {
	return [
		{ title: "Pull Planner - Settings" },
		{ name: "description", content: "Site to help plan your next characters to pull!" },
		{ property: "og:title", content: `Pull Planner - Settings` },
		{ property: "og:description", content: "Site to help plan your next characters to pull!" }
	];
}

function SettingsRoute({}: Route.ComponentProps) {
	return (
		<Settings></Settings>
	);
}

export default SettingsRoute;