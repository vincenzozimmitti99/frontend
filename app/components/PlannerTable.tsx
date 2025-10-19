"use client";

import {
	type PlannerData,
	type Pullable,
	type OtherIncome,
	type RegularIncome,
	type ExtendedPullable,
	type SelectedPullablesGroup,
	type ExtendedIncome,
	type ExtendedRegularIncome,
	type SavedItem,
	type MonthlyPass,
	type Server,
	type Games,
	isRegularIncome,
	isPullable,
	isEndgameIncomeVariantGenshin,
	isEndgameIncomeVariantHSR,
	isExtendedPullable
} from "~/types/PlannerData";
import { type Config } from "./Planner";

import React, { useEffect, useMemo, useState } from "react";
import RankSelector from "./RankSelector";
import ItemTag from "./ItemTag";
import { calculateTotalCurrency, getServerResetTime, getStatisticalPullableValue } from "~/utils/common";

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

type PlannerTableProps = React.HTMLProps<HTMLDivElement> & {
	json: PlannerData;
	config: Config;
	monthlyPassState: [MonthlyPass, React.Dispatch<React.SetStateAction<MonthlyPass>>];
	combinedData: [(ExtendedPullable | ExtendedRegularIncome | ExtendedIncome | OtherIncome)[], React.Dispatch<React.SetStateAction<(ExtendedPullable | ExtendedRegularIncome | ExtendedIncome | OtherIncome)[]>>];
	// pullsFromTableState: [number, React.Dispatch<React.SetStateAction<number>>];
	pullsFromSelectedPullablesState: [SelectedPullablesGroup[], React.Dispatch<React.SetStateAction<SelectedPullablesGroup[]>>];
	selectedPullablesState: [ExtendedPullable[], React.Dispatch<React.SetStateAction<ExtendedPullable[]>>];
	esteemedLuck: string;
};

// type ExtendedEndgameIncome = EndgameIncome & {
// 	start: Date,
// 	end: Date
// }

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
		const value = getStatisticalPullableValue(game, esteemedLuck, item.type, rank);
		return { ...item, start: utcStartDate, end: utcEndDate, value: -value*160, rank };
	}
}

const groupByEndDate = (pullables: ExtendedPullable[]) => {
	if(!pullables || (pullables && !pullables.length)) return [];
	
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

	const rankChangeHandle = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, itemName: string, type: string) => {
		let rank = +event.target.value;
		if(isNaN(rank))
			rank = 0;
		if(type==="character"){
			if(rank>6) rank = 6; else if(rank<0) rank = 0;
		} else if(type==="weapon"){
			if(rank>5) rank = 5; else if(rank<1) rank = 1;
		}

		setSavedItems((prev) => {
			let newSaved = prev.map((item) =>
				item.name === itemName ? { ...item, rank: rank } : item
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
		if(!pullables || !pullables.length) return [];

		let endgameIncome = [];
		let firstStartDate = new Date([...pullables].sort((a, b) => +a.start - +b.start)[0].start); // Finds real first start date in pullables array
		let lastEndDate = new Date([...pullables].sort((a, b) => +b.end - +a.end)[0].end); // Finds real last end date in pullables array

		// Make endgameIncome items up to date
		for(let item of props.json.endgameIncome){
			if(isEndgameIncomeVariantGenshin(item)){
				let resetDate = getServerResetTime(firstStartDate, server).lastReset;
				resetDate.setUTCDate(item.resetsEvery);
				resetDate.setUTCMonth(resetDate.getUTCMonth() - 1);
				while(resetDate < new Date()){
					resetDate.setUTCMonth(resetDate.getUTCMonth() + 1);
				}

				let start = new Date(resetDate);
				start.setUTCMonth(start.getUTCMonth() - 1);
				while(start<lastEndDate){ // Make copies until they can be useful to get pull for banners
					endgameIncome.push({
						...item,
						name: `${item.name} (${dateFormatter(start)})`,
						start: new Date(start),
						end: new Date(resetDate.getTime() - 1) // End 1ms before next
					});
					start.setUTCMonth(start.getUTCMonth() + 1);
					resetDate.setUTCMonth(resetDate.getUTCMonth() + 1);
				}
			} else if(isEndgameIncomeVariantHSR(item)){
				let resetStart = new Date(item.resetStart);
				if(server==="Asia"){ // Adjust date only for Asia server
					resetStart.setUTCDate(resetStart.getUTCDate() - 1);
				}
				let endgameNextReset = getServerResetTime(resetStart, server).nextReset;
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
	}, [props.json.endgameIncome]);

	const regularIncome: ExtendedRegularIncome[] = useMemo(
		() =>{
			if(!pullables || !pullables.length) return [];

			let regularIncome = [];
			const pullablesByEndDate = groupByEndDate(pullables);
			let firstStartDate = new Date([...pullables].sort((a, b) => +a.start - +b.start)[0].start); // Finds real first start date in pullables array
			let lastEndDate = new Date([...pullables].sort((a, b) => +b.end - +a.end)[0].end); // Finds real last end date in pullables array
			for(let item of props.json.regularIncome){
				if(isRegularIncome(item)){
					if(item.type==="monthly"){
						const startDate = getServerResetTime(new Date(Date.UTC(firstStartDate.getUTCFullYear(), firstStartDate.getUTCMonth(), 1)), server).nextReset;
						const endDate = new Date(startDate);
						endDate.setUTCMonth(endDate.getUTCMonth() + 1);
						endDate.setUTCSeconds(endDate.getUTCSeconds() - 1);

						do{
							regularIncome.push({
								...item,
								name: `${item.name} (${startDate.toLocaleDateString(undefined, { timeZone: "UTC", month: "long"})})`,
								start: new Date(startDate),
								calculationStart: new Date(startDate),
								end: new Date(endDate)
							});

							startDate.setUTCMonth(startDate.getUTCMonth() + 1);
							endDate.setUTCMonth(endDate.getUTCMonth() + 1);
						} while(startDate < lastEndDate);
					} else {
						for(let i=0;i<pullablesByEndDate.length;i++){
							if(pullablesByEndDate[i].selectedPullables[0].type==="character"){
								let startDate = new Date(pullablesByEndDate[i].startDate); // Keep original dates for ordering purposes
								let endDate = new Date(pullablesByEndDate[i].endDate);
								let calculationStart = i>0?new Date(pullablesByEndDate[i-1].endDate):new Date();
								let recurrence;
								if(item.type==="premium"){
									if(props.monthlyPassState[0].enabled){
										recurrence = -1;
										if(!props.monthlyPassState[0].always){
											if(props.monthlyPassState[0].endDate){
												let monthlyPassEndDate = getServerResetTime(new Date(props.monthlyPassState[0].endDate), server).nextReset;
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
								regularIncome.push({
									...item,
									name: `${item.name} until ${formatVersion(pullablesByEndDate[i].version)} end`,
									start: startDate,
									end: endDate,
									calculationStart,
									recurrence: recurrence
								});
								// console.log(regularIncome[0]);
							}
						}
					}
				}
			}
			
			return regularIncome.filter(item => !!item)
		},
		[props.json.regularIncome, props.monthlyPassState[0]]
	);

	const otherIncome = useMemo(() => {
		return props.json.otherIncome.map((item) => {
			let startDate = getServerResetTime(new Date(item.start), server).nextReset;
			let endDate;
			if(item.end){
				endDate = getServerResetTime(new Date(item.end), server).nextReset;
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
		() => {
			const combinedData = sortByDate([...regularIncome, ...endgameIncome, ...otherIncome, ...pullables].filter((item) => !!item));
			props.combinedData[1](combinedData);
			return combinedData;
			// sortByVersion(regularIncome, endgameIncome, otherIncome, pullables).filter((item) => !!item),
		}, [regularIncome, endgameIncome, otherIncome, pullables]
	);

	const groupByDatesSelectedPullables = useMemo(() => {
		return groupByEndDate(selectedPullables);
	}, [selectedPullables]);

	// Update parent state with total pulls
	useEffect(() => {
		// I have to get the last of this at 99% esteemed luck and check if it's < 0
		const separatedCounts = groupByDatesSelectedPullables.map((pullableGroup) => {
			return {
				"name": pullableGroup.selectedPullables.map(item => item.name).join(" + "),
				"pullables": pullableGroup.selectedPullables,
				"data": combinedData
				.filter((item) => {
					const savedItem = savedItems.find((saved) => saved.name === item.name);
					return !savedItem?.disabled && +new Date(item.start)<+new Date(pullableGroup.endDate);
				})
				// .reduce((sum, current) => {
				// 	return sum + calculateTotalCurrency(current);
				// }, 0)
			}
		});

		// const excludedPullableCount = combinedData
		// 	.filter((item) => {
		// 		const savedItem = savedItems.find((saved) => saved.name === item.name);
		// 		return !savedItem?.disabled && !isExtendedPullable(item);
		// 	})
		// 	.reduce((sum, current) => {
		// 		return sum + calculateTotalCurrency(current);
		// 	}, 0);
		props.pullsFromSelectedPullablesState[1](separatedCounts);
		// props.pullsFromTableState[1](excludedPullableCount);
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

	/**
	 * This function generates a custom extended row based on the item.
	 * To-do: still need to support endgame content and other events customization.
	 * @param item 
	 * @returns A disable checkbox and a custom JSX based on the item
	 */
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
				rankSelector = <div>
					<span className="mr-[4px]">Desired {props.config.rankCharacter}</span>
					<RankSelector minRank={0} maxRank={6} defaultValue={savedItem?.rank || 0} rankFirstLetter={props.config.rankCharacter[0]} onChange={(event) => {rankChangeHandle(event, item.name, item.type)}} />
				</div>
			} else if(item.type==="weapon"){
				rankSelector = <div>
					<span className="mr-[4px]">Desired {props.config.rankWeapon}</span>
					<RankSelector minRank={1} maxRank={5} defaultValue={savedItem?.rank || 1} rankFirstLetter={props.config.rankWeapon[0]} onChange={(event) => {rankChangeHandle(event, item.name, item.type)}} />
				</div>
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
					<th className="text-left">{`Pulls (${props.config.currency})`}</th>
					<th className="text-left"></th>
				</tr>
			</thead>
			<tbody>
				{
					combinedData.map((item, index) => {
						let currencyCount = calculateTotalCurrency(item, server);
						// console.log(item.start, item.end);
						const dateStart = new Date("calculationStart" in item?item.calculationStart:item.start);
						// console.log(item.name, dateStart);
						const dateEnd = item.end?new Date(item.end):undefined;
						
						const pullCount = Math.floor(currencyCount/160);

						const mainRow = (
							<tr key={`main-${index}`}>
								<td title={`${dateStart.toLocaleString(undefined, {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"})} - ${dateEnd?.toLocaleString(undefined, {year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit"})} ${dateEnd?"(Duration: " + msToTime(+dateEnd-+dateStart) + ")":""}`}>
									<div className="date-cell">
										{dateEnd?
										<><span>{dateFormatter(dateStart)}</span> - <span>{dateFormatter(dateEnd)}</span></>
										: dateFormatter(dateStart)}
									</div>
								</td>
								<td>
									<div className="description">
										<span className="mr-[4px]">{item.name}</span>
										<ItemTag item={item} />
									</div>
								</td>
								<td className={`text-right ${pullCount > 0 ? "text-green-500" : pullCount < 0 ? "text-red-500" : ""} ${isItemDisabled(item.name)?"line-through":""}`}>
									{pullCount > 0 ? `+${pullCount} (+${currencyCount})` : `${pullCount} (${currencyCount})`}
								</td>
								<td className="text-center">
									<div className="flex">
										{
											(!isRegularIncome(item) || item.type==="monthly") &&
											<button onClick={() => toggleExpand(index)}>
												{expandedIcon(expandedRow === index)}
											</button>
										}
									</div>
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