import json from "../assets/json/hsr.json";
import pullablesJson from "../assets/json/hsr-pullables.json";

import Planner from "~/components/Planner";
import type { Route } from "./+types/honkai-star-rail";
import { parsePullables } from "~/utils/common";

export function meta({}) {
	return [
		{ title: "Pull Planner - Honkai: Star Rail" },
		{ name: "description", content: "Plan your gacha pulls across upcoming banners. Very f2p friendly!" },
		{ property: "og:title", content: `Pull Planner - Honkai: Star Rail` },
		{ property: "og:description", content: "Plan your gacha pulls across upcoming banners. Very f2p friendly!" }
	];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
	return parsePullables(json, pullablesJson);
}

function HonkaiStarRail({ loaderData }: Route.ComponentProps) {
	const json = loaderData;

	return (
		<Planner json={json} />
	)
}

export default HonkaiStarRail;