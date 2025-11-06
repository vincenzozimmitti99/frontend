import json from "../assets/json/zzz.json";
import pullablesJson from "../assets/json/zzz-pullables.json";

import Planner from "~/components/Planner";
import type { Route } from "./+types/zenless-zone-zero";
import { parsePullables } from "~/utils/common";

export function meta({}) {
	return [
		{ title: "Pull Planner - Zenless Zone Zero" },
		{ name: "description", content: "Site to help plan your next characters to pull!" },
		{ property: "og:title", content: `Pull Planner - Zenless Zone Zero` },
		{ property: "og:description", content: "Site to help plan your next characters to pull!" }
	];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
	return parsePullables(json, pullablesJson);
}

function ZenlessZoneZero({ loaderData }: Route.ComponentProps) {
	const json = loaderData;

	return (
		<Planner json={json} />
	)
}

export default ZenlessZoneZero;