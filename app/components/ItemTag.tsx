import { isEndgameIncome, isExtendedPullable, isRegularIncome, type ExtendedIncome, type ExtendedPullable, type ExtendedRegularIncome, type OtherIncome } from "~/types/PlannerData";
import clsx from "~/utils/clsx";

type ItemTagProps = React.HTMLAttributes<HTMLDivElement> & {
	item: ExtendedPullable | ExtendedIncome | ExtendedRegularIncome | OtherIncome;
}

function ItemTag({ item, className, ...rest }: ItemTagProps){
	let config = null;
	if(isExtendedPullable(item)){
		config = {
			text: item.type[0].toUpperCase() + item.type.substring(1),
			color: "#c16f08"
		};
	} else if(isRegularIncome(item)){
		config = {
			text: "Regular Income",
			color: "#187318"
		};
	} else if(isEndgameIncome(item)){
		config = {
			text: "Endgame Income",
			color: "#931515"
		};
	} else {
		config = {
			text: "Event",
			color: "#3131af"
		};
	}

	return(
		<div {...rest} className={className?`${className} item-tag`:"item-tag"} style={{backgroundColor: config.color}}>
			{config.text}
		</div>
	);
}

export default ItemTag;