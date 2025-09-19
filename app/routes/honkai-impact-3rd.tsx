export function meta({}) {
	return [
		{ title: "Pull Planner - Honkai Impact 3rd" },
		{ name: "description", content: "Site to help plan your next characters to pull!" },
		{ property: "og:title", content: `Pull Planner - Honkai Impact 3rd` },
		{ property: "og:description", content: "Site to help plan your next characters to pull!" }
	];
}

type Props = {}

function HonkaiImpact3rd({}: Props) {
	return (
		<div>Honkai Impact 3rd</div>
	)
}

export default HonkaiImpact3rd;