import json from "../assets/json/genshin.json";
import pullablesJson from "../assets/json/genshin-pullables.json";

import Planner from "~/components/Planner";
import type { Route } from "./+types/genshin-impact";
import { parsePullables } from "~/utils/common";

export function meta({}) {
	return [
		{ title: "Pull Planner - Genshin Impact" },
		{ name: "description", content: "Site to help plan your next characters to pull!" },
		{ property: "og:title", content: `Pull Planner - Genshin Impact` },
		{ property: "og:description", content: "Site to help plan your next characters to pull!" }
	];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
	return parsePullables(json, pullablesJson);
}

function GenshinImpact({ loaderData }: Route.ComponentProps) {
	const json = loaderData;

	return (
		<Planner json={json} />
	)
}

export default GenshinImpact;