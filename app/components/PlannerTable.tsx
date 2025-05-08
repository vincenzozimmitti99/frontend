/**
 * - Castorice banner was already over in the morning of 4/30. Should have expired at 12PM instead, since it's phase 1.
 * - Check for endgame times, but this one might be wrong too.
 */

"use client";

import type { PlannerData, EndgameIncome, EndgameIncomeVariantGenshin, EndgameIncomeVariantHSR, Pullable, Income, OtherIncome, RegularIncome, ExtendedPullable, ExtendedIncome, ExtendedRegularIncome, SavedItem, MonthlyPass, Server, Games } from "~/types/PlannerData";
import type { Config } from "./Planner";
// import genshinLuck from "../assets/json/genshin-luck.json";
import hsrLuck from "../assets/json/hsr-luck.json";

import React, { useEffect, useMemo, useState } from "react";

const server = "Europe" as Server;

// Debug function
function msToTime(duration: number): string {
    const seconds = Math.floor((duration / 1000) % 60);
    const minutes = Math.floor((duration / (1000 * 60)) % 60);
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    const days = Math.floor(duration / (1000 * 60 * 60 * 24));

    const paddedHours = hours < 10 ? "0" + hours : hours.toString();
    const paddedMinutes = minutes < 10 ? "0" + minutes : minutes.toString();
    const paddedSeconds = seconds < 10 ? "0" + seconds : seconds.toString();

    return `${days}d ${paddedHours}h ${paddedMinutes}m ${paddedSeconds}s`;
}


function getServerResetTime(server: Server, now = new Date()) {
	// Map of server reset offsets in hours relative to UTC
	const serverOffsets = {
		Europe: 3,   // 04:00 GMT+1 => 03:00 UTC
		Asia: 20,    // 04:00 GMT+8 => 20:00 UTC (previous day)
		America: 9   // 04:00 GMT-5 => 09:00 UTC
	};
  
	let offsetUTC = serverOffsets[server];
	if(offsetUTC === undefined) {
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

type PlannerTableProps = React.HTMLProps<HTMLDivElement> & {
	json: PlannerData;
	config: Config;
	monthlyPassState: [MonthlyPass, React.Dispatch<React.SetStateAction<MonthlyPass>>];
	pullsFromTableState: [number, React.Dispatch<React.SetStateAction<number>>];
	pullsFromSelectedPullablesState: [{ name: string; currencyCount: number; }[], React.Dispatch<React.SetStateAction<{ name: string; currencyCount: number; }[]>>];
	selectedPullablesState: [ExtendedPullable[], React.Dispatch<React.SetStateAction<ExtendedPullable[]>>];
	esteemedLuck: string;
};

// type ExtendedEndgameIncome = EndgameIncome & {
// 	start: Date,
// 	end: Date
// }

const isEndgameIncome = (item: any): item is EndgameIncomeVariantGenshin | EndgameIncomeVariantHSR => {
	return isEndgameIncomeVariantGenshin(item) || isEndgameIncomeVariantHSR(item);
}

const isEndgameIncomeVariantGenshin = (income: EndgameIncome): income is EndgameIncomeVariantGenshin => {
	return (income as EndgameIncomeVariantGenshin).resetsEvery !== undefined;
}

const isEndgameIncomeVariantHSR = (income: EndgameIncome): income is EndgameIncomeVariantHSR => {
	return (income as EndgameIncomeVariantHSR).resetStart !== undefined &&
		(income as EndgameIncomeVariantHSR).resetInterval !== undefined;
}

const isRegularIncome = (item: any): item is RegularIncome => {
	return (item as RegularIncome).type === "daily" || (item as RegularIncome).type === "premium" || (item as RegularIncome).type === "weekly";
}

const isPullable = (item: any): item is Pullable => {
	return (item as Pullable).type === "character" || (item as Pullable).type === "weapon";
}

const isExtendedPullable = (item: any): item is ExtendedPullable => {
	return (item as ExtendedPullable).value !== undefined && (item as ExtendedPullable).rank !== undefined;
}

const expandedIcon = (isExpanded: boolean) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		strokeWidth={1.5}
		stroke="currentColor"
		className="size-6"
	>
		<path
		strokeLinecap="round"
		strokeLinejoin="round"
		d={isExpanded ? "m4.5 15.75 7.5-7.5 7.5 7.5" : "m19.5 8.25-7.5 7.5-7.5-7.5"}
		/>
	</svg>
);

const sortByDate = (dates: (ExtendedRegularIncome | ExtendedIncome | OtherIncome | ExtendedPullable)[]) => {
	return dates.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

/**
 * Subtracts end to start and divides to get the ms difference. The result is positive if end is greater than start.
 * @param startDate 
 * @param endDate 
 * @returns 
 */
const dateDifference = (startDate: Date, endDate: Date) =>
	endDate.getTime() - startDate.getTime();

/**
 * Subtracts end to start and divides to get the days difference. The result is positive if end is greater than start.
 * @param startDate 
 * @param endDate 
 * @returns 
 */
const daysDifference = (startDate: Date, endDate: Date) =>
	Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

const dateFormatter = (date: Date) => {
	let timeZone;
	switch(server){
		case "Europe":
			timeZone = "Etc/GMT-1";
			break;
		case "America":
			timeZone = "Etc/GMT+5";
			break;
		case "Asia":
		default:
			timeZone = "Etc/GMT-8";
			break;
	}
	return date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", timeZone });
}

const formatVersion = (version: string) => {
	const versionSplit = version.split(".");
	const phase = versionSplit.pop();
	version = versionSplit.join(".");
	return version + " Phase " + phase;
}

const getIndexFromPercentage = (percentage: number, cumulativeArray: number[]) => {
	percentage = Math.max(0, Math.min(100, percentage)) / 100;

	for(let i = 0; i < cumulativeArray.length; i++){
		if(cumulativeArray[i] > percentage) return i;
	}

	return cumulativeArray.length - 1;
};

/**
 * Date.getUTCDay() doesn't account for timezones (which is right), and Date.getDay() only accounts for client locale.
 * This becomes a problem when counting Mondays because both functions are not suited.
 * @param date Date to apply offset to
 * @param offset The offset in hours
 * @returns Input date with input hours offset
 */
const getOffsetUTCDay = (date: Date, offset: number) => {
	return new Date(date.getTime() + offset * 1000*60*60).getUTCDay();
}

const calculateTotalCurrency = (item: ExtendedPullable | ExtendedIncome | ExtendedRegularIncome | ExtendedIncome | OtherIncome): number => {
	let recurrence = (("recurrence" in item)?item.recurrence:1);

	if(recurrence===-1){
		if(isRegularIncome(item)){
			let startServerResetTime = getServerResetTime(server, item.calculationStart).lastReset;
			let endServerResetTime = getServerResetTime(server, item.end).lastReset;

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

/**
 * Converts a Pullable (character or weapon) to ExtendedPullable
 * !!! Watch out !!!
 * !!! Genshin times seems to be different. Probably ZZZ and WuWa times will be different too !!!
 * !!! Watch out !!!
 * @param item Pullable to be converted
 * @param server Player's server, dates change based on this parameter
 * @param game Current game page, times change based on this parameter
 * @param rank Player's desired rank to calculate required pulls
 * @param esteemedLuck Player's esteemed luck to calculate required pulls
 * @returns ExtendedPullable if version is valid (phase is a requirement), undefined if not valid or pullable end date is already over
 */
const convertToExtendedPullable = (item: Pullable, server: Server, game: Games | string, rank: number, esteemedLuck: string): ExtendedPullable | undefined => {
	let splitVersion = item.version.split(".");
	let phase = splitVersion.pop();
	let version = splitVersion.join(".");
	let utcStartDate, utcEndDate;
	if(phase==="1"){
		utcStartDate = new Date(item.start);
		utcStartDate.setUTCHours(3);
		utcEndDate = new Date(item.end);

		if(game==="genshin"){
			switch(server){
				case "Europe":
					utcEndDate.setUTCHours(16);
					break;
				case "Asia":
					utcEndDate.setUTCHours(9);
					break;
				case "America":
					utcEndDate.setUTCHours(22);
					break;
			}
		} else if(game==="hsr"){
			switch(server){
				case "Europe":
					utcEndDate.setUTCHours(10);
					break;
				case "Asia":
					utcEndDate.setUTCHours(3);
					break;
				case "America":
					utcEndDate.setUTCHours(16);
					break;
			}
		}

		utcEndDate.setUTCMinutes(59);
		utcEndDate.setUTCSeconds(59);
	} else if(phase==="2"){
		utcStartDate = new Date(item.start);
		utcEndDate = new Date(item.end); 

		switch(server){
			case "Europe":
				if(game==="genshin"){
					utcStartDate.setUTCHours(17);
					utcEndDate.setUTCHours(13);
				} else if(game==="hsr"){
					utcStartDate.setUTCHours(11);
					utcEndDate.setUTCHours(13);
				}
				break;
			case "Asia":
				if(game==="genshin"){
					utcStartDate.setUTCHours(10);
					utcEndDate.setUTCHours(6);
				} else if(game==="hsr"){
					utcStartDate.setUTCHours(4);
					utcEndDate.setUTCHours(6);
				}
				break;
			case "America":
				if(game==="genshin"){
					utcStartDate.setUTCHours(23);
					utcEndDate.setUTCHours(19);
				} else if(game==="hsr"){
					utcStartDate.setUTCHours(17);
					utcEndDate.setUTCHours(19);
				}
				break;
		}

		utcEndDate.setUTCMinutes(59);
		utcEndDate.setUTCSeconds(59);
	}

	if (!utcStartDate || !utcEndDate) {
		return;
	}

	if(utcEndDate>new Date()){
		const type = item.type === "character" ? 0 : 1;
		if(item.type==="character"){
			if(rank>7) rank = 7; else if(rank<0) rank = 0;
		} else if(item.type==="weapon"){
			rank-=1;
			if(rank>5) rank = 5; else if(rank<0) rank = 0;
		}
		
		const pullsRequired = getIndexFromPercentage(
			+esteemedLuck,
			hsrLuck[type]["data"][rank]["pulls"] // This needs to adapt to the game!!! Fix it later!
		);
		return { ...item, start: utcStartDate, end: utcEndDate, value: -pullsRequired * 160, rank };
	}
}

const groupByEndDate = (pullables: ExtendedPullable[]) => {
	interface PullableGroup {
		selectedPullables: ExtendedPullable[];
		startDate: Date;
		endDate: Date;
		version: string;
	}

	const pullableMap: { [key: string]: PullableGroup } = {}; // Hash map to group by 'end' date

	// Populate the hash map
	for(let i=0;i<pullables.length;i++){
		const { start, end, version } = pullables[i];

		// If the 'end' date is not in the map, initialize it
		if(!pullableMap[end.toString()]){
			pullableMap[end.toString()] = {
				selectedPullables: [],
				startDate: start,
				endDate: end,
				version: version
			};
		}

		// Add the current pullable to the group
		pullableMap[end.toString()].selectedPullables.push(pullables[i]);
	}

	// Convert the hash map values into the desired array format
	return Object.values(pullableMap);
}

function PlannerTable(props: PlannerTableProps){
	const [expandedRow, setExpandedRow] = useState<number | null>(null);
	const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

	const updateStorage = (propertyName: string, value: string | object) => {
		let pullPlannerFromStorage = localStorage.getItem("pullplanner");
		if(pullPlannerFromStorage){
			let pullPlanner = JSON.parse(pullPlannerFromStorage);
			pullPlanner[props.config.game][propertyName] = value;
			localStorage.setItem("pullplanner", JSON.stringify(pullPlanner));
			return true;
		}
		return false;
	};

	const inputChangeHandle = (event: React.ChangeEvent<HTMLInputElement>, itemName: string) => {
		const value = event.target.value;
		setSavedItems((prev) => {
			let newSaved = prev.map((item) =>
				item.name === itemName ? { ...item, rank: +value } : item
			);
			updateStorage("savedItems", newSaved);
			return newSaved;
		});
	};

	const isItemDisabled = (itemName: string) => savedItems.some((savedItem) => savedItem.name === itemName && savedItem.disabled);

	const toggleDisabled = (itemName: string) => {
		setSavedItems((prev) => {
			let newSaved = prev.map((item) =>
				item.name === itemName ? { ...item, disabled: !item.disabled } : item
			);
			updateStorage("savedItems", newSaved);
			return newSaved;
		});
	};

	const pullables: ExtendedPullable[] = useMemo(() => {
		return props.json.pullables.map((item) => {
			if(isPullable(item)){
				let rank = savedItems.find((savedItem) => savedItem.name === item.name)?.rank || 0;
				// let temp = convertToExtendedPullable(item, server, props.config.game, rank, props.esteemedLuck);
				// console.log(msToTime(temp?.end.getTime()-temp?.start.getTime()));
				return convertToExtendedPullable(item, server, props.config.game, rank, props.esteemedLuck);
			}
		}).filter(item => !!item);
	}, [props.json.pullables, props.esteemedLuck, savedItems]);

	const endgameIncome: ExtendedIncome[] = useMemo(() => {
		let endgameIncome = [];
		let lastEndDate = new Date([...pullables].sort((a, b) => +b.end - +a.end)[0].end); // Finds real last end date in pullables array

		// Make endgameIncome items up to date
		for(let item of props.json.endgameIncome){
			if(isEndgameIncomeVariantGenshin(item)){

			} else if(isEndgameIncomeVariantHSR(item)){
				let resetStart = new Date(item.resetStart);
				if(server==="Asia"){ // Adjust date only for Asia server
					resetStart.setUTCDate(resetStart.getUTCDate() - 1);
				}
				let endgameNextReset = getServerResetTime(server, resetStart).nextReset;
				while(endgameNextReset < new Date()){
					endgameNextReset.setUTCDate(endgameNextReset.getUTCDate() + item.resetInterval);
				}

				let start = new Date(endgameNextReset);
				start.setUTCDate(start.getUTCDate() - item.resetInterval);
				while(start<lastEndDate){ // Make copies until they can be useful to get pull for banners
					endgameIncome.push({
						...item,
						name: `${item.name} (${dateFormatter(start)})`,
						start: new Date(start),
						end: new Date(endgameNextReset.getTime() - 1) // End 1ms before next
					});
					start.setUTCDate(start.getUTCDate() + item.resetInterval);
					endgameNextReset.setUTCDate(endgameNextReset.getUTCDate() + item.resetInterval);
				}

				// console.log(endgameIncome);

				// Debug time remaining
				// console.log(msToTime(endgameNextReset.getTime()-new Date().getTime()));
			}
		}

		return endgameIncome.filter(item => !!item);

		// let firstStartDate = new Date(pullables[0].start);
		// let lastEndDate = new Date(pullables[pullables.length-1].end); // Maybe search for the last real end date? Or make sure the JSON has always the pullables ordered

		// let endgameIncome = [];
		// let today = new Date(); // This should ensure the reset at 4AM.. at least in my PC, with my locale. Should test with different locales.

		// for(let item of props.json.endgameIncome){ // Makes the original date up to date
		// 	if(isEndgameIncomeVariantGenshin(item)){
		// 		let copy: EndgameIncomeVariantGenshin = {...item};
		// 		let end = new Date(today.getFullYear(), today.getMonth(), copy.resetsEvery);
		// 		// end.setMonth(end.getMonth()-1);
		// 		end.setHours(4);
		// 		end.setSeconds(-1);
		// 		let checkEnd = new Date(end);
		// 		checkEnd.setMonth(checkEnd.getMonth()-1);
		// 		if(dateDifference(firstStartDate, end)>0){ // Checks if last endgame content is still useful to first banner start date
		// 			end = checkEnd;
		// 		}
		// 		copy.resetDate = end.toDateString();
		// 		endgameIncome.push(copy);
		// 	} else if(isEndgameIncomeVariantHSR(item)){
		// 		let copy: EndgameIncomeVariantHSR = {...item};
		// 		let end = new Date(copy.resetStart);
		// 		end.setHours(4);
		// 		end.setSeconds(-1);
		// 		while(dateDifference(end, today)>0){
		// 			end.setDate(end.getDate()+item.resetInterval);
		// 			copy.resetStart = end.toDateString();
		// 		}
		// 		endgameIncome.push(copy);
		// 	}
		// }

		// let endgameIncomeCopy = [...endgameIncome];
		// // console.log(endgameIncomeCopy);
		// endgameIncome = [];
		// for(let item of endgameIncomeCopy){ // Make copies of the endgame income until last pullable date
		// 	if(isEndgameIncomeVariantGenshin(item)){
		// 		endgameIncome.push(item);
		// 		let i = 1;
		// 		let resetDate = new Date(item.resetDate);
		// 		while(resetDate<lastEndDate){
		// 			let copy = {...item};
		// 			resetDate = new Date(copy.resetDate);
		// 			resetDate.setMonth(resetDate.getMonth() + i);
		// 			copy.resetDate = resetDate.toDateString();
		// 			endgameIncome.push(copy);
		// 			i++;
		// 		}
		// 	} else if(isEndgameIncomeVariantHSR(item)){
		// 		endgameIncome.push(item);
		// 		let i = 1;
		// 		let resetStart = new Date(item.resetStart);
		// 		while(resetStart<lastEndDate){
		// 			let copy = {...item};
		// 			resetStart = new Date(copy.resetStart);
		// 			resetStart.setDate(resetStart.getDate() + copy.resetInterval*i);
		// 			copy.resetStart = resetStart.toDateString();
		// 			endgameIncome.push(copy);
		// 			i++;
		// 		}
		// 	}
		// }

		// return endgameIncome.map((item): ExtendedIncome | undefined => {
		// 	if(isEndgameIncomeVariantGenshin(item)){ // Maybe doesn't work as intended yet
		// 		let resetDate = new Date(item.resetDate);
		// 		let start, end;
		// 		start = new Date(resetDate);
		// 		end = new Date(resetDate);
		// 		end.setMonth(resetDate.getMonth()+1);
		// 		end.setSeconds(-1);
		// 		return {
		// 			...item,
		// 			start,
		// 			end
		// 		};
		// 	} else if(isEndgameIncomeVariantHSR(item)){ // Works as intended
		// 		let end = new Date(item.resetStart);
		// 		end.setHours(4);
		// 		let start = new Date(end);
		// 		start.setDate(end.getDate()-item.resetInterval);
		// 		end.setSeconds(-1);
		// 		return {
		// 			...item,
		// 			name: `${item.name} (${dateFormatter(start)})`,
		// 			start,
		// 			end
		// 		};
		// 	}
		// }).filter(item => !!item)
	}, [props.json.endgameIncome]);

	const regularIncome: ExtendedRegularIncome[] = useMemo(
		() =>{
			let dailiesUntil = [];
			const pullablesByEndDate = groupByEndDate(pullables);
			for(let item of props.json.regularIncome){
				for(let i=0;i<pullablesByEndDate.length;i++){
					if(pullablesByEndDate[i].selectedPullables[0].type==="character"){
						if(isRegularIncome(item)){
							let startDate = new Date(pullablesByEndDate[i].startDate); // Keep original dates for ordering purposes
							let endDate = new Date(pullablesByEndDate[i].endDate);
							let calculationStart = i>0?new Date(pullablesByEndDate[i-1].endDate):new Date();
							let recurrence;
							if(item.type==="premium"){
								if(props.monthlyPassState[0].enabled){
									recurrence = -1;
									if(!props.monthlyPassState[0].always){
										if(props.monthlyPassState[0].endDate){
											let monthlyPassEndDate = getServerResetTime(server, new Date(props.monthlyPassState[0].endDate)).nextReset;
											if(isNaN(monthlyPassEndDate.getTime())){
												endDate = calculationStart;
											} else if(monthlyPassEndDate < endDate){
												endDate = new Date(Math.max(+monthlyPassEndDate, +calculationStart));
												// console.log(calculationStart, endDate);
											}
										}
									}
								} else {
									recurrence = 0;
								}
							} else {
								recurrence = item.recurrence;
							}
							dailiesUntil.push({
								...item,
								name: `${item.name} until ${formatVersion(pullablesByEndDate[i].version)} end`,
								start: startDate,
								end: endDate,
								calculationStart,
								recurrence: recurrence
							});
							// console.log(dailiesUntil[0]);
						}
					}
				}
			}
			
			return dailiesUntil.filter(item => !!item)
		},
		[props.json.regularIncome, props.monthlyPassState[0]]
	);

	const otherIncome = useMemo(() => {
		return props.json.otherIncome.map((item) => {
			let startDate = getServerResetTime(server, new Date(item.start)).nextReset;
			let endDate;
			if(item.end){
				endDate = getServerResetTime(server, new Date(item.end)).nextReset;
			} else {
				endDate = new Date(startDate.getTime() + 3*(1000*60*60*24)); // 3 days after start date
			}
			
			if(endDate>new Date()){
				return {
					...item,
					start: startDate,
					end: endDate
				}
			}
		}).filter((item) => !!item);
	}, [props.json.otherIncome]);

	const selectedPullables = useMemo(() => {
		let selectedPullables = [];
		for(let savedItem of savedItems){
			for(let item of pullables){
				if(item?.name===savedItem.name){
					if(!savedItem.disabled){
						selectedPullables.push(item);
					}
				}
			}
		}
		return selectedPullables;
	}, [pullables, savedItems]);

	// Here make some conditions that check the sorting selected by the user and sorts accordingly. Or maybe not because sorting seems bad?
	// OK OK here is the best idea: group everything by PATCH VERSION and each group is ordered like this:
	// 3.2(regularIncome > endgameIncome (if startDate is between group startDate and endDate) > otherIncome > pullables), ...3.3()
	const combinedData = useMemo(
		() => sortByDate([...regularIncome, ...endgameIncome, ...otherIncome, ...pullables].filter((item) => !!item)),
			// sortByVersion(regularIncome, endgameIncome, otherIncome, pullables).filter((item) => !!item),
		[regularIncome, endgameIncome, otherIncome, pullables]
	);

	const groupByDatesSelectedPullables = useMemo(() => {
		return groupByEndDate(selectedPullables);
	}, [selectedPullables]);

	// Update parent state with total pulls
	useEffect(() => {
		const separatedCounts = groupByDatesSelectedPullables.map((pullableGroup) => {
			return {
				"name": pullableGroup.selectedPullables.map((item) => item.name).join(" + "),
				"currencyCount": combinedData
				.filter((item) => {
					const savedItem = savedItems.find((saved) => saved.name === item.name);
					return !savedItem?.disabled && dateDifference(new Date(pullableGroup.endDate), new Date(item.start))<0;
				})
				.reduce((sum, current) => {
					return sum + calculateTotalCurrency(current);
				}, 0)
			}
		});

		const totalPulls = combinedData
			.filter((item) => {
				const savedItem = savedItems.find((saved) => saved.name === item.name);
				return !savedItem?.disabled;
			})
			.reduce((sum, current) => {
				return sum + calculateTotalCurrency(current);
			}, 0);
		props.pullsFromSelectedPullablesState[1](separatedCounts);
		props.pullsFromTableState[1](totalPulls);
	}, [combinedData, savedItems, groupByDatesSelectedPullables]);

	useEffect(() => {
		const initialSavedItems = combinedData.map((item) => {
			if(isExtendedPullable(item)){
				return {
					name: item.name,
					disabled: true,
					rank: item.type==="character"?0:1
				}
			}
			return({
				name: item.name,
				disabled: false,
			});
		});

		const initialPullPlanner = {
			[props.config.game]: {
				monthlyPass: {enabled: false, always: false, endDate: null},
				savedItems: initialSavedItems
			}
		}

		const pullPlannerFromStorage = localStorage.getItem("pullplanner");
		if(!pullPlannerFromStorage){
			localStorage.setItem("pullplanner", JSON.stringify(initialPullPlanner));
		} else {
			let pullPlanner = JSON.parse(pullPlannerFromStorage);
			if(!pullPlanner[props.config.game]){
				localStorage.setItem("pullplanner", JSON.stringify({...pullPlanner, ...initialPullPlanner}));
				return;
			}

			if(pullPlanner[props.config.game].savedItems){
				let savedItemsFromStorageObject = pullPlanner[props.config.game].savedItems;
				for(let initialSavedItem of initialSavedItems){
					for(let savedItem of savedItemsFromStorageObject){
						if(initialSavedItem.name===savedItem.name){
							initialSavedItem.disabled = savedItem.disabled;
							if (savedItem.rank !== undefined) {
								initialSavedItem.rank = savedItem.rank; // Restore rank
							}
						}
					}
				}
			}
		}
		setSavedItems(initialSavedItems);
	}, []);

	// Save to localStorage whenever savedItems changes
	// useEffect(() => {
	// 	localStorage.setItem("savedItems", JSON.stringify(savedItems));
	// }, [savedItems]);

	// Update selectedPullablesState whenever selectedPullables changes
	useEffect(() => {
		props.selectedPullablesState[1](selectedPullables);
	}, [selectedPullables]);

	const toggleExpand = (index: number) => {
		setExpandedRow(expandedRow === index ? null : index);
	};

	const generateExtendedRow = (item: RegularIncome | ExtendedIncome | ExtendedPullable | OtherIncome) => {
		const isDisabled = isItemDisabled(item.name);
		let disableCheckbox = (
			<div>
				<label>
					<input
						type="checkbox"
						checked={isDisabled}
						onChange={() => {toggleDisabled(item.name);}}
					/>
					Disable
				</label>
			</div>
		);
		if(isExtendedPullable(item)){
			let savedItem = savedItems.find((savedItem) => {return savedItem.name===item.name});
			let rankSelector;
			if(item.type==="character"){
				rankSelector = <div><span>Desired {props.config.rankCharacter}</span><input type="text" className="text-right" value={savedItem?.rank} onChange={(event) => {inputChangeHandle(event, item.name)}}/></div>
			} else if(item.type==="weapon"){
				rankSelector = <div><span>Desired {props.config.rankWeapon}</span><input type="text" className="text-right" value={savedItem?.rank} onChange={(event) => {inputChangeHandle(event, item.name)}}/></div>
			}
			return [
				disableCheckbox,
				rankSelector
			];
		}
		return disableCheckbox;
	}

	return (
		<table className="planner-table w-full border-collapse bg-table-primary">
			<thead>
				<tr>
					<th className="text-left">Date</th>
					<th className="text-left">Description</th>
					<th className="text-left">{props.config.th3}</th>
					<th className="text-left"></th>
				</tr>
			</thead>
			<tbody>
				{
					combinedData.map((item, index) => {
						let currencyCount = calculateTotalCurrency(item);
						// console.log(item.start, item.end);
						const dateStart = new Date("calculationStart" in item?item.calculationStart:item.start);
						// console.log(item.name, dateStart);
						const dateEnd = item.end ? new Date(item.end) : undefined;
						
						const pullCount = Math.floor(currencyCount/160);

						const mainRow = (
							<tr key={`main-${index}`}>
								<td title={`${dateStart.toLocaleString(undefined, {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"})} - ${dateEnd?.toLocaleString(undefined, {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"})} ${dateEnd?"(Duration: " + msToTime(+dateEnd-+dateStart) + ")":""}`}>
									{dateEnd
									? `${dateFormatter(dateStart)} - ${dateFormatter(dateEnd)}`
									: dateFormatter(dateStart)}
								</td>
								<td className="">{item.name}</td>
								<td className={`text-right ${pullCount > 0 ? "text-green-500" : pullCount < 0 ? "text-red-500" : ""} ${isItemDisabled(item.name)?"line-through":""}`}>
									{pullCount > 0 ? `+${pullCount} (+${currencyCount})` : `${pullCount} (${currencyCount})`}
								</td>
								<td className="text-center">
									{
										!isRegularIncome(item) &&
										<button onClick={() => toggleExpand(index)}>
											{expandedIcon(expandedRow === index)}
										</button>
									}
									
								</td>
							</tr>
						);

						const extendedRow =
							expandedRow === index && (
								<tr key={`expanded-${index}`} className="bt-0">
									<td colSpan={4} className="">
										<div>
											{
												generateExtendedRow(item)
											}
										</div>
									</td>
								</tr>
							);

						return [mainRow, extendedRow];
					})
				}
			</tbody>
		</table>
	);
}

export default PlannerTable;