// import genshinLuck from "../assets/json/genshin-luck.json";
import { isRegularIncome, type ExtendedIncome, type ExtendedPullable, type ExtendedRegularIncome, type OtherIncome, type PlannerData, type PullablesJSON, type Server } from "~/types/PlannerData";
import hsrLuck from "../assets/json/hsr-luck.json";

export const parsePullables = (json: Omit<PlannerData, "pullables"> & { pullables: { id: string, start: string, end: string, version: string }[] }, pullablesJson: PullablesJSON) => {
	return { ...json, "pullables": json.pullables.map((p1) => {
		let p2 = pullablesJson.characters.find((c) => c.id === p1.id);
		if(p2)
			return { ...p1, "name": p2.name, type: "character" };
		else
			p2 = pullablesJson.weapons.find((w) => w.id === p1.id);
			if(p2)
				return { ...p1, "name": p2.name, type: "weapon"};
			else
				return null
	}).filter((item) => !!item)}
}

export const getIndexFromPercentage = (percentage: number, cumulativeArray: number[]) => {
	percentage = Math.max(0, Math.min(100, percentage)) / 100;

	for(let i=0;i<cumulativeArray.length;i++){
		if(cumulativeArray[i]>percentage) return i;
	}

	return cumulativeArray.length - 1;
};

export const getStatisticalPullableValue = (game: string, esteemedLuck: string, type: string, rank: number) => {
	const typeIndex = type === "character" ? 0 : 1;
	if(type==="character"){
		if(rank>6) rank = 6; else if(rank<0) rank = 0;
	} else if(type==="weapon"){
		rank-=1;
		if(rank>4) rank = 4; else if(rank<0) rank = 0;
	}
	
	/* if(game==="genshin"){
		return getIndexFromPercentage(
			+esteemedLuck,
			genshinLuck[type]["data"][rank]["pulls"]
		);
	} else */if(game==="hsr"){
		return getIndexFromPercentage(
			+esteemedLuck,
			hsrLuck[typeIndex]["data"][rank]["pulls"]
		);
	} else {
		return getIndexFromPercentage(
			+esteemedLuck,
			hsrLuck[typeIndex]["data"][rank]["pulls"]
		);
	}
};

export function getServerResetTime(now = new Date(), server?: Server) {
	// Map of server reset offsets in hours relative to UTC
	const serverOffsets = {
		Europe: 3,   // 04:00 GMT+1 => 03:00 UTC
		Asia: 20,    // 04:00 GMT+8 => 20:00 UTC (previous day)
		America: 9   // 04:00 GMT-5 => 09:00 UTC
	};
  
	let offsetUTC;
	if(server){
		offsetUTC = serverOffsets[server];
	} else {
		offsetUTC = serverOffsets["America"]; // Default to America, just in case
	}
  
	let utcYear = now.getUTCFullYear();
	let utcMonth = now.getUTCMonth();
	let utcDate = now.getUTCDate();
  
	let resetUTC = new Date(Date.UTC(utcYear, utcMonth, utcDate, offsetUTC, 0, 0));
  
	// If current time is before today's reset, use yesterday's reset
	if(now < resetUTC){
		resetUTC.setUTCDate(resetUTC.getUTCDate() - 1);
	}
  
	return{
		lastReset: resetUTC,
		nextReset: new Date(resetUTC.getTime() + 24 * 60 * 60 * 1000)
	};
}

/**
 * Date.getUTCDay() doesn't account for timezones (which is right), and Date.getDay() only accounts for client locale.
 * This becomes a problem when counting Mondays because both functions are not suited.
 * @param date Date to apply offset to
 * @param offset The offset in hours
 * @returns Input date with input hours offset
 */
export const getOffsetUTCDay = (date: Date, offset: number) => {
	return new Date(date.getTime() + offset * 1000*60*60).getUTCDay();
}

export const calculateTotalCurrency = (item: ExtendedPullable | ExtendedIncome | ExtendedRegularIncome | OtherIncome, server?: Server): number => {
	let recurrence = (("recurrence" in item)?item.recurrence:1);

	if(recurrence===-1){
		if(isRegularIncome(item)){
			let startServerResetTime = getServerResetTime(item.calculationStart, server).lastReset;
			let endServerResetTime = getServerResetTime(item.end, server).lastReset;

			if(item.type==="weekly"){
				let offset;
				switch(server){
					case "Europe":
						offset = 1;
						break;
					case "Asia":
						offset = 8;
						break;
					case "America":
					default:
						offset = -5;
						break;
				}

				let mondayCounter = 0;
				let tempDate = new Date(startServerResetTime.getTime() + 1000*60*60*24); // Account for weekly rewards already taken today
				while(tempDate<=endServerResetTime){ // Account for dailies until the very end of the banner (shouldn't matter, but it's correct now)
					// console.log(getOffsetUTCDay(tempDate, offset));
					if(getOffsetUTCDay(tempDate, offset)===1){
						mondayCounter++;
					}
					tempDate.setUTCDate(tempDate.getUTCDate() + 1);
				}

				return mondayCounter * item.value;
			} else { // Case f2p + premium
				return (+endServerResetTime - +startServerResetTime)/1000/60/60/24 * item.value;
			}
		}
	}

	return recurrence*item.value; // Covers ExtendedPullable, ExtendedIncome and OtherIncome mainly
};