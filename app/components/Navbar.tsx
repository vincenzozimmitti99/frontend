import { useEffect, useState } from "react";
import { NavLink } from "react-router";
import clsx from "~/utils/clsx";

type Props = {
	onClick: () => void,
	className: string,
	shrinked: boolean
}

const BurgerIcon = (props: Props) => {
	return(
		<div className={clsx("inline-flex justify-end", props.className)}>
			<div className="p-2 hover:bg-blue-950" onClick={props.onClick}>
				{
					props.shrinked
					?
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6">
						<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
					</svg>
					:
					<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6">
						<path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
					</svg>
				}
			</div>
		</div>
	);
}

const Navbar = () => {
	const [shrinked, setShrinked] = useState(true);
	const defaultLiStyle = clsx(`p-4 hover:bg-blue-950 text-white transition-bg duration-130 ease-in-out overflow-hidden whitespace-nowrap`, (shrinked?"hidden":""));

	return(
		<nav className={clsx("navbar flex flex-col flex-shrink-0 h-full align-center bg-blue-900 transition-width duration-300 ease-in-out", (shrinked?"w-[40px]":"w-[100%] sm:w-[240px]"))}>
			<BurgerIcon onClick={() => {setShrinked(!shrinked)}} shrinked={shrinked} className="m-0 mb-10" />
			<ul>
				<NavLink to="/" onClick={() => {setShrinked(!shrinked)}}>{({ isActive }) => {return <li className={clsx(defaultLiStyle, "border-b-1", isActive?"bg-blue-950":"")}>Pull Planner</li>}}</NavLink>
				<NavLink to="/honkai-impact-3rd" onClick={() => {setShrinked(!shrinked)}}>{({ isActive }) => {return <li className={clsx(defaultLiStyle, isActive?"bg-blue-950":"")}>Honkai Impact 3rd</li>}}</NavLink>
				<NavLink to="/genshin-impact" onClick={() => {setShrinked(!shrinked)}}>{({ isActive }) => {return <li className={clsx(defaultLiStyle, isActive?"bg-blue-950":"")}>Genshin Impact</li>}}</NavLink>
				<NavLink to="/honkai-star-rail" onClick={() => {setShrinked(!shrinked)}}>{({ isActive }) => {return <li className={clsx(defaultLiStyle, isActive?"bg-blue-950":"")}>Honkai: Star Rail</li>}}</NavLink>
				<NavLink to="/zenless-zone-zero" onClick={() => {setShrinked(!shrinked)}}>{({ isActive }) => {return <li className={clsx(defaultLiStyle, isActive?"bg-blue-950":"")}>Zenless Zone Zero</li>}}</NavLink>
			</ul>
		</nav>
	);
}

export default Navbar;