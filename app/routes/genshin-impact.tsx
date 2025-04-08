import Planner from "~/components/Planner";

export function meta({}) {
	return [
		{ title: "Pull Planner - Genshin Impact" },
		{ name: "description", content: "Site to help plan your next characters to pull!" },
	];
}

type Props = {}

function GenshinImpact({}: Props) {
	return (
		<Planner game="genshin" />
	)
}

export default GenshinImpact;