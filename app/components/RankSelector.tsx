type RankSelectorProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
	minRank: number,
	maxRank: number,
	defaultValue: number,
	rankFirstLetter: string
}

/**
 * Rank selector for gacha games
 * @param minRank
 * @param maxRank
 * @param defaultValue
 * @param rankFirstLetter the first letter of the rank
 */
function RankSelector({
	minRank,
	maxRank,
	defaultValue,
	rankFirstLetter,
	...rest
}: RankSelectorProps){
	let options = [];
	for(let i=minRank;i<=maxRank;i++){
		options.push(<option key={i} value={i}>{rankFirstLetter}{i}</option>);
	}

	return(
		<select {...rest} className="select">
			{options}
		</select>
	);
}

export default RankSelector;