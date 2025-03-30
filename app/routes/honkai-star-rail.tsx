import Planner from "~/components/Planner";

export function meta({}) {
	return [
		{ title: "Pull Planner - Honkai: Star Rail" },
		{ name: "description", content: "Site to help plan your next characters to pull!" },
	];
}

type Props = {}

function HonkaiStarRail({}: Props) {
	return (
		<Planner game="hsr" />
	)
}

export default HonkaiStarRail;