"use client";

import type { PlannerData, EndgameIncome, EndgameIncomeVariantGenshin, EndgameIncomeVariantHSR, Pullable, Income, OtherIncome, RegularIncome } from "~/types/PlannerData";
import type { Config } from "./Planner";
import hsrLuck from "../assets/json/hsr-luck.json";

import { useEffect, useMemo, useState } from "react";

type PlannerTableProps = React.HTMLProps<HTMLDivElement> & {
	json: PlannerData;
	config: Config;
	pullsFromTableState: [number, React.Dispatch<React.SetStateAction<number>>];
	esteemedLuck: string;
};

type ExtendedIncome = Income & {
	start: Date,
	end: Date
}

type ExtendedRegularIncome = RegularIncome & {
	start: Date,
	end: Date
}

// type ExtendedEndgameIncome = EndgameIncome & {
// 	start: Date,
// 	end: Date
// }

type ExtendedPullable = Pullable & {
	value: number,
	rank: number
}

type SavedItem = {
	name: string,
	disabled: boolean,
	rank?: number
}

const isEndgameIncomeVariantGenshin = (income: EndgameIncome): income is EndgameIncomeVariantGenshin => {
	return (income as EndgameIncomeVariantGenshin).resetsEvery !== undefined;
}

const isEndgameIncomeVariantHSR = (income: EndgameIncome): income is EndgameIncomeVariantHSR => {
	return (income as EndgameIncomeVariantHSR).resetStart !== undefined &&
		(income as EndgameIncomeVariantHSR).resetInterval !== undefined;
}

const isRegularIncome = (item: any): item is RegularIncome => {
	return (item as RegularIncome).type === "f2p" || (item as RegularIncome).type === "premium";
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

const dateDifference = (startDate: Date, endDate: Date) =>
	endDate.getTime() - startDate.getTime();

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

const calculateTotalCurrency = (
	value: number,
	recurrence: number | undefined = 1,
	start?: Date,
	end?: Date,
	resetStart?: string,
	resetInterval?: number,
): number => {
	if(recurrence === -1 && start && end){
		if(resetStart && resetInterval){
			return value*Math.floor(daysDifference(new Date(resetStart), end)/resetInterval); // This works though
		} else {
			return value*daysDifference(start, end); // Not sure if daily count is right, maybe missing one day to the last day
		}
	}

	return recurrence*value;
};

function PlannerTable(props: PlannerTableProps){
	const [expandedRow, setExpandedRow] = useState<number | null>(null);
	const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

	const inputChangeHandle = (event: React.ChangeEvent<HTMLInputElement>, itemName: string) => {
		const value = event.target.value;
		setSavedItems((prev) => {
			return prev.map((item) =>
				item.name === itemName ? { ...item, rank: +value } : item
			);
		});
	};

	const isItemDisabled = (itemName: string) => savedItems.some((savedItem) => savedItem.name === itemName && savedItem.disabled);

	const toggleDisabled = (itemName: string) => {
		setSavedItems((prev) => {
			return prev.map((item) =>
				item.name === itemName ? { ...item, disabled: !item.disabled } : item
			);
		});
	};

	// Memoize regular incomes
	const regularIncome: (ExtendedRegularIncome | undefined)[] = useMemo(
		() =>
		props.json.regularIncome.map((item) => {
			if(isRegularIncome(item))
				return({
					...item,
					start: new Date(),
					end: new Date("04-30-2025"), // End date of selected character or weapon
				})}),
		[props.json.regularIncome]
	);

	const endgameIncome: (ExtendedIncome | undefined)[] = useMemo(() => {
		let endgameIncome = [];
		let today = new Date();

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
		for(let item of endgameIncomeCopy){
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
		})
	}, [props.json.endgameIncome]);

	const pullables: (ExtendedPullable | undefined)[] = useMemo(() => {
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
		});
	}, [props.json.pullables, props.esteemedLuck, savedItems]);

	// Here make some conditions that check the sorting selected by the user and sorts accordingly. Or maybe not because sorting seems bad?
	const combinedData = useMemo(
		() => sortByDate([...regularIncome, ...endgameIncome, ...props.json.otherIncome, ...pullables].filter((item) => !!item)),
		[regularIncome, endgameIncome, props.json.otherIncome, pullables]
	);

	// Update parent state with total pulls
	useEffect(() => {
		const totalPulls = combinedData
			.filter((item) => {
				const savedItem = savedItems.find((saved) => saved.name === item.name);
				return !savedItem?.disabled;
			})
			.reduce((sum, current) => {
				const dateStart = new Date(current.start);
				const dateEnd = current.end ? new Date(current.end) : undefined;
				const hasRecurrence = "recurrence" in current;
				if(hasRecurrence){
					return sum + Math.floor(calculateTotalCurrency(
						current.value,
						hasRecurrence ? current.recurrence : undefined,
						dateStart,
						dateEnd
					));
				}
				return sum + current.value;
			}, 0) / 160;

		props.pullsFromTableState[1](totalPulls);
	}, [combinedData, props.pullsFromTableState, savedItems]);

	useEffect(() => {
		// Load savedItems from localStorage
		const savedItemsFromStorage = localStorage.getItem("savedItems");
		const initialSavedItems = combinedData.map((item) => {
			if(isExtendedPullable(item)){
				return {
					name: item.name,
					disabled: true,
					rank: item.type==="character"?0:1
				}
			}
			return ({
				name: item.name,
				disabled: false,
			})
		});

		if(savedItemsFromStorage) {
			let savedItemsFromStorageObject = JSON.parse(savedItemsFromStorage);
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
			setSavedItems(initialSavedItems);
		} else {
			setSavedItems(initialSavedItems);
			localStorage.setItem("savedItems", JSON.stringify(initialSavedItems));
		}
	}, [props.json.pullables, props.json.otherIncome, props.json.endgameIncome]);
	
	useEffect(() => {
		// Save to localStorage whenever savedItems changes
		localStorage.setItem("savedItems", JSON.stringify(savedItems));
	}, [savedItems]);

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
				rankSelector = <div><span>Desired Eidolon</span><input type="text" className="text-right" value={savedItem?.rank} onChange={(event) => {inputChangeHandle(event, item.name)}}/></div>
			} else if(item.type==="weapon"){
				rankSelector = <div><span>Desired Superimposion</span><input type="text" className="text-right" value={savedItem?.rank} onChange={(event) => {inputChangeHandle(event, item.name)}}/></div>
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
						const dateStart = new Date(item.start);
						const dateEnd = item.end ? new Date(item.end) : undefined;
						const hasRecurrence = "recurrence" in item;
						let currencyCount;
						if(isRegularIncome(item)){
							currencyCount = calculateTotalCurrency(
								item.value,
								hasRecurrence ? item.recurrence : undefined,
								dateStart,
								dateEnd,
								item.resetStart,
								item.resetInterval
							);
						} else {
							currencyCount = calculateTotalCurrency(
								item.value,
								hasRecurrence ? item.recurrence : undefined,
								dateStart,
								dateEnd
							);
						}
						
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