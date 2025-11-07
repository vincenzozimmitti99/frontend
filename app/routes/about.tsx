import About from "~/components/About";
import type { Route } from "./+types/about";

export function meta({}) {
	return [
		{ title: "Pull Planner - About" },
		{ name: "description", content: "Plan your gacha pulls across upcoming banners. Very f2p friendly!" },
		{ property: "og:title", content: `Pull Planner - About` },
		{ property: "og:description", content: "Plan your gacha pulls across upcoming banners. Very f2p friendly!" }
	];
}

function AboutRoute({}: Route.ComponentProps) {
	return (
		<About />
	);
}

export default AboutRoute;