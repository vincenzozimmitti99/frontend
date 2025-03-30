import GameCard from "~/components/GameCard";

export function meta({}) {
	return [
		{ title: "Pull Planner" },
		{ name: "description", content: "Site to help plan your next characters to pull!" },
	];
}

type Props = {};

const Home = (props: Props) => {
	return(
		<div className="cards-container m-4 md:my-auto">
			<span>Fan-made pull planner for your gacha games</span>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* <button className="carousel-left-button">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
						<path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
					</svg>
				</button>
				<button className="carousel-right-button">
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
						<path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
					</svg>
				</button> */}
				<GameCard game="hi3" />
				<GameCard game="genshin" />
				<GameCard game="hsr" />
				<GameCard game="zzz" />
			</div>
		</div>
	);
};

export default Home;