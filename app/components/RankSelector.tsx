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
function RankSelector(props: RankSelectorProps){
	let options = [];
	for(let i=props.minRank;i<=props.maxRank;i++){
		options.push(<option value={i}>{props.rankFirstLetter}{i}</option>);
	}

	return (
		<select {...props} className="select">
			{options.map((item) => {
				return item;
			})}
		</select>
	);
}

export default RankSelector;