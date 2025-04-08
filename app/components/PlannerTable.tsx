"use client";

import type { PlannerData, EndgameIncome, EndgameIncomeVariantGenshin, EndgameIncomeVariantHSR, Pullable, Income, OtherIncome, RegularIncome, ExtendedPullable, ExtendedIncome, ExtendedRegularIncome, SavedItem, MonthlyPass } from "~/types/PlannerData";
import type { Config } from "./Planner";
// import genshinLuck from "../assets/json/genshin-luck.json";
import hsrLuck from "../assets/json/hsr-luck.json";

import React, { useEffect, useMemo, useState } from "react";

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

const isExtendedPullable = (item: any): item is ExtendedPullable => {
	return (item as ExtendedPullable).type === "character" || (item as ExtendedPullable).type === "weapon";
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

const dateFormatter = (date: Date) =>
	date.toLocaleDateString(undefined, { day: "2-digit", month: "2-digit" });

const getIndexFromPercentage = (percentage: number, cumulativeArray: number[]) => {
	percentage = Math.max(0, Math.min(100, percentage)) / 100;

	for (let i = 0; i < cumulativeArray.length; i++) {
		if (cumulativeArray[i] > percentage) return i;
	}

	return cumulativeArray.length - 1;
};

const calculateTotalCurrency = (item: ExtendedPullable | ExtendedRegularIncome | ExtendedIncome | OtherIncome): number => {
	let recurrence = (("recurrence" in item)?item.recurrence:1);

	if(recurrence === -1 && item.start && item.end){ // Case regular rewards
		if(isRegularIncome(item)){
			if(item.type==="weekly"){ // Case weeklies
				const countWeeklies = (start: Date, end: Date): number => {
					const adjustDateForReset = (date: Date): Date => {
						// Where the magic happens, skip first week count only if it's over 4AM.
						// Since only the first instance has a start=today, it only happens there.
						// The successive ones won't have any skip
						if(date.getHours()>=4){
							date.setDate(date.getDate()+1);
						}
						date.setHours(4, 0, 0, 0);
						return date;
					};
	
					let newStart = adjustDateForReset(new Date(start));
					let newEnd = adjustDateForReset(new Date(end));
					let resetDay = ("resetDay" in item)?item.resetDay:1; // Default as Monday
					let counter = 0;
					while(dateDifference(newStart, newEnd)>0){
						if(newStart.getDay()!==resetDay){
							newStart.setDate(newStart.getDate()+1);
							continue;
						}
						counter++;
						newStart.setDate(newStart.getDate()+7);
					}
					return counter;
				};
				// start = new Date("05-05-2025");
				// start.setHours(3, 59, 0, 0);
				// console.log(item.start, item.end);
				return item.value*countWeeklies(item.start, item.end);
			} else { // Case dailies + monthly pass
				return item.value*daysDifference(item.start, item.end); // Not sure if daily count is right, maybe missing one day to the last day
			}
		}
	}
	
	// Case any other rewards or pullable, which is most likely recurrence 1
	return recurrence*item.value;
};

const groupByEndDate = (pullables: ExtendedPullable[]) => {
	interface PullableGroup {
		selectedPullables: ExtendedPullable[];
		startDate: string;
		endDate: string;
	}

	const pullableMap: { [key: string]: PullableGroup } = {}; // Hash map to group by 'end' date

	// Populate the hash map
	for(let i=0;i<pullables.length;i++){
		const { start, end } = pullables[i];

		// If the 'end' date is not in the map, initialize it
		if(!pullableMap[end]){
			pullableMap[end] = {
				selectedPullables: [],
				startDate: start,
				endDate: end
			};
		}

		// Add the current pullable to the group
		pullableMap[end].selectedPullables.push(pullables[i]);
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

	const endgameIncome: ExtendedIncome[] = useMemo(() => {
		let endgameIncome = [];
		let today = new Date(); // This should ensure the reset at 4AM.. at least in my PC, with my locale. Should test with different locales.

		for(let item of props.json.endgameIncome){
			if(isEndgameIncomeVariantHSR(item)){
				let copy = {...item};
				let end = new Date(copy.resetStart);
				end.setHours(4);
				end.setSeconds(-1);
				while(dateDifference(end, today)>0){
					end.setDate(end.getDate()+item.resetInterval);
					copy.resetStart = end.toDateString();
				}
				endgameIncome.push(copy);
			}
		}

		let endgameIncomeCopy = [...endgameIncome];
		endgameIncome = [];
		let copies = 2;
		for(let item of endgameIncomeCopy){ // Make copies of the endgame income
			if(isEndgameIncomeVariantHSR(item)){
				endgameIncome.push(item);
				for(let i=1;i<copies+1;i++){
					let copy = {...item};
					let resetStart = new Date(copy.resetStart);
					resetStart.setDate(resetStart.getDate() + copy.resetInterval*i);
					copy.resetStart = resetStart.toDateString();
					endgameIncome.push(copy);
				}
			}
		}

		return endgameIncome.map((item): ExtendedIncome | undefined => {
			if(isEndgameIncomeVariantGenshin(item)){ // Maybe doesn't work as intended yet
				let year = today.getFullYear();
				let month = today.getMonth();
				let resetsEvery = new Date(year, month, item.resetsEvery, 4);
				let start, end;
				if(daysDifference(resetsEvery, today)>0){ // Already happened
					start = new Date(resetsEvery);
					end = new Date(resetsEvery);
					end.setMonth(month+1);
					end.setSeconds(-1);
				} else { // Didn't happen
					start = new Date(resetsEvery);
					start.setMonth(month-1);
					end = new Date(resetsEvery);
					end.setSeconds(-1);
				}
				return {
					...item,
					start,
					end
				};
			} else if(isEndgameIncomeVariantHSR(item)){ // Works as intended
				let end = new Date(item.resetStart);
				end.setHours(4);
				let start = new Date(end);
				start.setDate(end.getDate()-item.resetInterval);
				end.setSeconds(-1);
				return {
					...item,
					name: `${item.name} (${dateFormatter(start)})`,
					start,
					end
				};
			}
		}).filter(item => !!item)
	}, [props.json.endgameIncome]);

	const pullables: ExtendedPullable[] = useMemo(() => {
		return props.json.pullables.map((item) => {
			if(isExtendedPullable(item)){
				const type = item.type === "character" ? 0 : 1;
				let rank = savedItems.find((savedItem) => savedItem.name === item.name)?.rank || 0;
				if(item.type==="character"){
					if(rank>7) rank = 7; else if(rank<0) rank = 0;
				} else if(item.type==="weapon"){
					rank-=1;
					if(rank>5) rank = 5; else if(rank<0) rank = 0;
				}
				
				const pullsRequired = getIndexFromPercentage(
					+props.esteemedLuck,
					hsrLuck[type]["data"][rank]["pulls"]
				);
				return { ...item, value: -pullsRequired * 160 };
			}
		}).filter(item => !!item);
	}, [props.json.pullables, props.esteemedLuck, savedItems]);

	const regularIncome: ExtendedRegularIncome[] = useMemo(
		() =>{
			let dailiesUntil = [];
			const pullablesByEndDate = groupByEndDate(pullables);
			for(let item of props.json.regularIncome){
				for(let i=0;i<pullablesByEndDate.length;i++){
					if(pullablesByEndDate[i].selectedPullables[0].type==="character"){
						if(isRegularIncome(item)){
							let startDate = i>0?new Date(pullables[i-1].end):new Date();
							let endDate = new Date(pullablesByEndDate[i].endDate);
							let recurrence;
							if(item.type==="premium"){
								if(props.monthlyPassState[0].enabled){
									recurrence = -1;
									if(!props.monthlyPassState[0].always){
										if(props.monthlyPassState[0].endDate){
											let newEndDate = new Date(Math.min(endDate.getTime(), new Date(props.monthlyPassState[0].endDate).getTime()));
											if(!isNaN(newEndDate.getTime()))
												endDate = newEndDate;
											if(endDate<startDate)
												endDate = startDate;
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
								name: `${item.name} until ${pullablesByEndDate[i].selectedPullables[0].name}`,
								start: startDate,
								end: endDate,
								recurrence: recurrence
							});
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
			if(item.end){
				if(dateDifference(new Date(item.end), new Date())<0){
					return item
				}
			} else {
				if(dateDifference(new Date(item.start), new Date())<3*(1000*60*60*24)){
					return item
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
	const combinedData = useMemo(
		() => sortByDate([...regularIncome, ...endgameIncome, ...otherIncome, ...pullables].filter((item) => !!item)),
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
		<table className="planner-table w-full border-collapse">
			<thead>
				<tr className="bg-gray">
				<th className="text-left p-2 border">Date</th>
				<th className="text-left p-2 border">Description</th>
				<th className="text-left p-2 border">{props.config.th3}</th>
				<th className="text-left p-2 border"></th>
				</tr>
			</thead>
			<tbody>
				{
					combinedData.map((item, index) => {
						let currencyCount = calculateTotalCurrency(item);
						// console.log(item.start, item.end);
						const dateStart = new Date(item.start);
						const dateEnd = item.end ? new Date(item.end) : undefined;
						
						const pullCount = Math.floor(currencyCount/160);

						const mainRow = (
							<tr key={`main-${index}`}>
								<td className="p-2 border">
									{dateEnd
									? `${dateFormatter(dateStart)} - ${dateFormatter(dateEnd)}`
									: dateFormatter(dateStart)}
								</td>
								<td className="p-2 border">{item.name}</td>
								<td className={`p-2 border text-right ${pullCount > 0 ? "text-green-500" : pullCount < 0 ? "text-red-500" : ""} ${isItemDisabled(item.name)?"line-through":""}`}>
									{pullCount > 0 ? `+${pullCount} (+${currencyCount})` : `${pullCount} (${currencyCount})`}
								</td>
								<td className="p-2 border text-center">
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
								<tr key={`expanded-${index}`}>
									<td colSpan={4} className="p-4 border">
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