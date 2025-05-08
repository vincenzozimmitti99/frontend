import { Link } from "react-router";
import clsx from "~/utils/clsx";

const gameImages = {
	hi3: {
		title: "Honkai Impact 3rd",
		img: "hi3.jpg",
		href: "/honkai-impact-3rd"
	},
	genshin: {
		title: "Genshin Impact",
		img: "genshin-travelers.avif",
		href: "/genshin-impact"
	},
	hsr: {
		title: "Honkai: Star Rail",
		img: "hsr-trailblazers.webp",
		href: "/honkai-star-rail"
	},
	zzz: {
		title: "Zenless Zone Zero",
		img: "zzz.webp",
		href: "/zenless-zone-zero"
	},
};

type GameCardProps = React.HTMLProps<HTMLDivElement> & {
	game: keyof typeof gameImages
};

function GameCard(props: GameCardProps){
	const game = gameImages[props.game];
	if(!game) return;

	return(
		<Link to={game.href} className="game-card">
			<div {...props} className={clsx(props.className, "game-card border-b-4 text-center text-lg")}>
				<img src={game.img} className="game-card-img"></img>
				<div className="game-card-title">{game.title}</div>
			</div>
		</Link>
	);
}

export default GameCard;