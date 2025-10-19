// import html2canvas from "html2canvas";
import { type ExtendedPullable, type MonthlyPass, type PlannerData, type Games, type SelectedPullablesGroup, type SavedItem, isExtendedPullable, type Server, type ExtendedRegularIncome, type ExtendedIncome, type OtherIncome } from "~/types/PlannerData";

import { useEffect, useRef, useState } from "react";
import PlannerTable from "./PlannerTable";
import { calculateTotalCurrency, getServerResetTime, getStatisticalPullableValue } from "~/utils/common";

type PlannerProps = React.HTMLProps<HTMLDivElement> & {
	json: PlannerData
}

export interface Config{
	game: string;
    currency: string;
    pulls: string;
	rankCharacter: string;
	rankWeapon: string;
	monthlyPass: string;
	defaultRefundState: string;
}

const server = "Europe" as Server;

const loadConfig = (id: string) => {
	let config: Config;

	switch(id){
		case "3rd": // Fix
			config = {
				game: id,
				currency: "",
				pulls: "",
				rankCharacter: "",
				rankWeapon: "",
				monthlyPass: "",
				defaultRefundState: "0"
			};
			break;
		case "genshin":
			config = {
				game: id,
				currency: "Primogems",
				pulls: "Intertwined Fates",
				rankCharacter: "Constellation",
				rankWeapon: "Rank",
				monthlyPass: "Express Supply Pass",
				defaultRefundState: "3"
			};
			break;
		case "hsr":
			config = {
				game: id,
				currency: "Stellar Jades",
				pulls: "Star Rail Special Passes",
				rankCharacter: "Eidolon",
				rankWeapon: "Superimpose",
				monthlyPass: "Express Supply Pass",
				defaultRefundState: "1"
			};
			break;
		case "zzz":
			config = {
				game: id,
				currency: "Polychromes",
				pulls: "Encrypted Master Tapes",
				rankCharacter: "Mindscape Cinema",
				rankWeapon: "Overclock?", // Fix this later
				monthlyPass: "Express Supply Pass",
				defaultRefundState: "1"
			};
			break;
		case "wuwa":
			config = {
				game: id,
				currency: "Astrites",
				pulls: "Radiant Tides",
				rankCharacter: "",
				rankWeapon: "",
				monthlyPass: "Express Supply Pass",
				defaultRefundState: "0"
			};
			break;
		default:
			config = {
				game: id,
				currency: "currency",
				pulls: "pulls",
				rankCharacter: "Character Rank",
				rankWeapon: "Weapon Rank",
				monthlyPass: "Monthly Pass",
				defaultRefundState: "0"
			};
			break;
	};

	return config;
};

function Planner(props: PlannerProps){
	let config = loadConfig(props.json.id);

	const [yourCurrency, setYourCurrency] = useState("0");
	const [yourPulls, setYourPulls] = useState("0");
	const [characterPity, setCharacterPity] = useState("0");
	const [weaponPity, setWeaponPity] = useState("0");
	// const [pullsFromTable, setPullsFromTable] = useState(0);
	const [esteemedLuckDisabled, setEsteemedLuckDisabled] = useState(true);
	const [esteemedLuck, setEsteemedLuck] = useState("50");
	const [refund, setRefund] = useState(config.defaultRefundState);
	const [monthlyPass, setMonthlyPass] = useState<MonthlyPass>({enabled: false, always: false, endDate: null});

	const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
	const [combinedData, setCombinedData] = useState<(ExtendedPullable | ExtendedRegularIncome | ExtendedIncome | OtherIncome)[]>([]);
	const [selectedPullables, setSelectedPullables] = useState<ExtendedPullable[]>([]);
	const [pullsFromSelectedPullables, setPullsFromSelectedPullables] = useState<SelectedPullablesGroup[]>([]);
	const tableRef = useRef(null);

	const updateStorage = (propertyName: string, value: string | object) => {
		let pullPlannerFromStorage = localStorage.getItem("pullplanner");
		if(pullPlannerFromStorage){
			let pullPlanner = JSON.parse(pullPlannerFromStorage);
			pullPlanner[props.json.id][propertyName] = value;
			localStorage.setItem("pullplanner", JSON.stringify(pullPlanner));
			return true;
		}
		return false;
	};

	const toggleDisabled = (itemName: string) => {
		setSavedItems((prev) => {
			let newSaved = prev.map((item) =>
				item.name === itemName ? { ...item, disabled: !item.disabled } : item
			);
			updateStorage("savedItems", newSaved);
			return newSaved;
		});
	};

	const inputChangeHandle = (event: React.ChangeEvent<HTMLInputElement>, setState: React.Dispatch<React.SetStateAction<string>>) => {
		const value = event.target.value;
		setState(value);
	};

	const esteemedLuckSelectHandle = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		if(value){
			setEsteemedLuck(value);
			setEsteemedLuckDisabled(true);
		} else {
			setEsteemedLuckDisabled(false);
		}
	}

	const refundSelectHandle = (event: React.ChangeEvent<HTMLSelectElement>) => {
		const value = event.target.value;
		if(value){
			setRefund(value);
		}
	}

	const yourCurrencyHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
	
		if(/^\d*$/.test(value) && value.length<10){
			updateStorage("yourCurrency", value);
			setYourCurrency(value);
		}
	};

	const yourPullsHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
	
		if(/^\d*$/.test(value) && value.length<6){
			updateStorage("yourPulls", value);
			setYourPulls(value);
		}
	};

	const characterPityHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
	
		if(/^\d*$/.test(value) && value.length<6){
			updateStorage("characterPity", value);
			setCharacterPity(value);
		}
	};

	const weaponPityHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
	
		if(/^\d*$/.test(value) && value.length<6){
			updateStorage("weaponPity", value);
			setWeaponPity(value);
		}
	};

	const addPity = (pulls: number, currency: number, currentIndex: number, all: SelectedPullablesGroup[]) => {
		let hasCharacterPity = false
		let hasWeaponPity = false;

		for(let i=currentIndex;i>=0;i--){
			for(let type of all[i].pullables.map((item) => item.type)){
				if(type==="character"){
					hasCharacterPity = true;
				}
				if(type==="weapon"){
					hasWeaponPity = true;
				}

				if(hasCharacterPity && hasWeaponPity) break;
			}
		}

		if(hasCharacterPity){
			pulls += +characterPity
			currency += +characterPity*160;
		}
		if(hasWeaponPity){
			pulls += +weaponPity
			currency += +weaponPity*160;
		}
		return { pulls, currency };
	};

	const predictPlayerOutcome = (pullableGroups: SelectedPullablesGroup[]) => {
		if(!pullableGroups.length) return; // If empty return, nothing to calculate yet.

		// let item = {...pullableGroups[pullableGroups.length-1]};
		let pullableGroupsCopy = pullableGroups.map((item) => {return {
			...item,
			data: item.data.map(itemm => ({...itemm}))
		}});
		for(let pullableGroup of pullableGroupsCopy){
			for(let pullable of pullableGroup.data){
				if(isExtendedPullable(pullable)){
					pullable.value = -getStatisticalPullableValue(props.json.id, "99", pullable.type, pullable.rank)*160;
				}
			}
		}

		let tableCurrencies = pullableGroupsCopy.map(pullableGroup => pullableGroup.data.reduce((sum, current) => {
			return sum + calculateTotalCurrency(current, server);
		}, 0));
		let excludedPullablesCurrency = pullableGroupsCopy.map(pullableGroup => pullableGroup.data.reduce((sum, current) => {
			if(!isExtendedPullable(current))
				return sum + calculateTotalCurrency(current, server); // Fix!
			else
				return sum;
		}, 0));
		// console.log(excludedPullablesCurrency);
		const tablePullsCurrencies = tableCurrencies.map((tableCurrency, index) => {
			let pullables = pullableGroupsCopy[index].pullables;
			let tempPulls = Math.floor((+yourCurrency + tableCurrency)/160) + +yourPulls;
			let tempCurrency = +yourCurrency + +yourPulls*160 + tableCurrency;
			let refunds = pullRefunds(props.json.id as ("3rd" | "genshin" | "hsr" | "zzz" | "wuwa"), Math.floor(excludedPullablesCurrency[index]/160)+ + +yourPulls + Math.floor(+yourCurrency/160));
				switch(refund){
					case "1":
						tempPulls += refunds.best;
						tempCurrency += refunds.best*160;
						break;
					case "2":
						tempPulls += refunds.average;
						tempCurrency += refunds.average*160;
						break;
					case "3":
						tempPulls += refunds.worst;
						tempCurrency += refunds.worst*160;
						break;
					case "0":
					default:
						break;
				}

			let { pulls, currency } = addPity(tempPulls, tempCurrency, index, pullableGroupsCopy);
			return { pullables, pulls, currency };
		});
		// let last = tablePullsCurrencies[tablePullsCurrencies.length-1];
		const positives = tablePullsCurrencies.filter((item) => {return item.currency>=0;});
		const atLeastAPositive = positives.length?true:false;
		const allPositives = positives.length===tablePullsCurrencies.length;

		if(allPositives){ // Best case
			return <span className="text-green-500">You will be able to pull the selected characters/weapons even in the worst case!</span>;
		} else if(atLeastAPositive){ // Average case
			let items = positives.map((item) => {return item.pullables.map(item => item.name).join(" + ")});
			let positivesString = "";
			if(items.length>1){
				let lastElement = items.splice(items.length-1, 1);
				positivesString = items.join(", ") + " and " + lastElement[0];
			} else {
				positivesString = items.join(", ");
			}
			return <span className="text-orange-500">You are guaranteed to get {positivesString}, but you will need luck to get the others!</span>;
		} else {
			return <span className="text-red-500">You might not be able to pull everything you selected, let's hope for the best!</span>;
		}
	};

	const monthlyPassResolver = (endDate: string | null, always: boolean) => {
		if(!endDate || always) return "";
		
		let remainingDays = (+getServerResetTime(new Date(endDate), server).nextReset-+getServerResetTime(new Date(), server).lastReset)/1000/60/60/24;
		if(remainingDays>0){
			return "(" + remainingDays + " " + (remainingDays===1?"day":"days") + " remaining)";
		} else {
			return "(expired)";
		}
	};

	const pullRefunds = (game: Games, pulls: number) => {
		let refunds = {best: 0, average: 0, worst: 0}
		switch(game){
			case "hsr":
			default:
				refunds.best = Math.floor(0.10377586206896552*pulls);
				refunds.average = Math.floor(0.07788793103448277*pulls);
				refunds.worst = Math.floor(0.052*pulls);
		}

		return refunds;
	}

	useEffect(() => {
		const pullPlannerFromStorage = localStorage.getItem("pullplanner");
		if(pullPlannerFromStorage){
			let pullPlanner = JSON.parse(pullPlannerFromStorage);
			pullPlanner[props.json.id].yourCurrency?setYourCurrency(pullPlanner[props.json.id].yourCurrency):null;
			pullPlanner[props.json.id].yourPulls?setYourPulls(pullPlanner[props.json.id].yourPulls):null;
			pullPlanner[props.json.id].characterPity?setCharacterPity(pullPlanner[props.json.id].characterPity):null;
			pullPlanner[props.json.id].weaponPity?setWeaponPity(pullPlanner[props.json.id].weaponPity):null;
			pullPlanner[props.json.id].monthlyPass?setMonthlyPass(pullPlanner[props.json.id].monthlyPass):null;
		}
	}, []);

	// useEffect(() => {
	// 	let result = Math.floor(+yourCurrency + +yourPulls*160 + pullsFromTable);
	// 	setTotalPulls(result);
	// }, [yourCurrency, yourPulls, characterPity, weaponPity, pullsFromTable]);

	// async function exportAsImage(el: HTMLElement, name: string) {
	// 	// Clean oklch across all styles

	// 	const canvas = await html2canvas(el, {
	// 		useCORS: true,
	// 		backgroundColor: null,
	// 	});

	// 	const data = canvas.toDataURL("image/png");
	// 	const link = document.createElement("a");
	// 	link.href = data;
	// 	link.download = `${name}.png`;
	// 	link.click();
	// }

	return(
		<div className="mx-auto">
			{/* <button onClick={() => {exportAsImage(tableRef.current, "test")}}>Download Table</button> */}
			<div className="table-customization bg-table-primary max-w-sm md:max-w-[500px] mx-auto mt-[32px]">
				<div className="text-center font-bold mb-[10px]">Customization</div>
				<div className="grid gap-4 grid-cols-1 grid-row-1 md:grid-cols-2 customization-desktop-layout">
					<div className="[grid-area:a]">
						<label>
							{config.currency}
							<input type="text" className="text-right mt-[4px]" value={yourCurrency} placeholder="0" onChange={yourCurrencyHandle} />
						</label>
					</div>
					<div className="[grid-area:b]">
						<label>
							{config.pulls}
							<input type="text" className="text-right mt-[4px]" value={yourPulls} placeholder="0" onChange={yourPullsHandle} />
						</label>
					</div>
					<div className="[grid-area:c]">
						<label>
							{"Character Banner Pity"}
							<input type="text" className="text-right mt-[4px]" value={characterPity} placeholder="0" onChange={characterPityHandle} />
						</label>
					</div>
					<div className="[grid-area:d]">
						<label>
							{"Weapon Banner Pity"}
							<input type="text" className="text-right mt-[4px]" value={weaponPity} placeholder="0" onChange={weaponPityHandle} />
						</label>
					</div>
					<div className="[grid-area:e]">
						<span className="cursor-default">{config.monthlyPass}</span>
						<div className="monthly-pass-checkboxes mt-[4px] mb-[4px]">
							<label className="form-checkbox">
								<input type="checkbox" checked={monthlyPass.enabled} onChange={() => {setMonthlyPass((prev) => {let newMonthlyPass = {...prev, enabled: !prev.enabled}; updateStorage("monthlyPass", newMonthlyPass); return newMonthlyPass})}} />
								Enabled
							</label>
							<label className="form-checkbox ml-[16px]">
								<input type="checkbox" checked={monthlyPass.always} disabled={!monthlyPass.enabled} onChange={() => {setMonthlyPass((prev) => {return {...prev, always: !prev.always}})}} />
								Always
							</label>
						</div>
						<label>
							End date
							<div className="mt-[4px] flex items-center">
								<input type="text" className="text-right w-full md:!w-auto" value={monthlyPass.endDate || ""} disabled={monthlyPass.always || !monthlyPass.enabled} onChange={(event) => {setMonthlyPass((prev) => {return {...prev, endDate: event.target.value}})}} placeholder="MM/dd/yyyy" />
								<span className="flex-none ml-[4px]">{monthlyPassResolver(monthlyPass.endDate, monthlyPass.always)}</span>
							</div>
						</label>
					</div>
					<div className="[grid-area:f]">
						<label htmlFor="esteemed-luck">
							{"5★ Esteemed Luck"}
						</label>
						<div className="esteemed-luck">
							<select defaultValue={50} onChange={(event) => {esteemedLuckSelectHandle(event);}}>
								<option value={""}>Custom</option>
								<option value={50}>Average case</option>
								<option value={99}>Worst case</option>
							</select>
							<div className="input-percentage">
								<input id="esteemed-luck" type="text" className="text-right" value={esteemedLuck} placeholder="0-100" onChange={(event) => {inputChangeHandle(event, setEsteemedLuck)}} disabled={esteemedLuckDisabled} />
							</div>
						</div>
					</div>
					<div className="[grid-area:g]">
						<label htmlFor="refund">
							{"Undying Starlight Refund"}
						</label>
						<div className="mt-[4px]">
							<select defaultValue={config.defaultRefundState} className="select" id="refund" onChange={(event) => {refundSelectHandle(event)}}>
								<option value={0}>None</option>
								<option value={1}>Best case</option>
								<option value={2}>Average case</option>
								<option value={3}>Worst case</option>
							</select>
						</div>
					</div>
				</div>
				{/* <div class="form-group">
					<label>
						Planned characters/weapons<br />
						<div style="display: flex; align-items: center; margin-top: 4px;">
							<img src="https://img.game8.co/4105938/a7a620b0c9969474e506afc27d57874b.png/show" style="
								display: block;
								min-height: 48px;
								width: 48px;
								object-fit: cover;
							" />
							<img src="https://img.game8.co/4141885/719b5017394aa3ea256f67825484973f.png/show" style="
								margin-right: 4px;
								display: block;
								min-height: 48px;
								width: 48px;
								object-fit: cover;
							" />
							<span class="text-green-500">+6349938 (+1015990084)</span>
						</div>
					</label>
				</div> */}
				{/* Debug
				<div className="flex">
					<span>Selected pullables:</span>
					{selectedPullables.map((item) => {return <span>{item.name}</span>})}
				</div> */}
			</div>
			<div className="table-customization bg-table-primary max-w-[500px] mx-auto mt-[16px] mb-[16px]">
				<div className="flex flex-col mb-[8px]">
					<label className="mb-[4px] font-bold">
						{"Quick selection"}
					</label>
					<div>
					{combinedData.map((pullable, index) => {
						if(isExtendedPullable(pullable))
							return <label key={`quick-select-${index}`} className="inline-flex align-center select-none mr-[4px]"><input className="mr-[2px]" type="checkbox" checked={pullsFromSelectedPullables.some((item) => item.pullables.some((item) => item.name===pullable.name))} onChange={() => toggleDisabled(pullable.name)} />{pullable.name}</label>;
					})}
					</div>
				</div>
				<div>
					<label className="mb-[4px] font-bold">
						{"Planned characters/weapons"}
					</label>
					{pullsFromSelectedPullables.map((item, index) => {
						let tableCurrency = item.data.reduce((sum, current) => {
							return sum + calculateTotalCurrency(current, server); // Fix!
						}, 0);
						let excludedPullablesCurrency = item.data.reduce((sum, current) => {
							if(!isExtendedPullable(current))
								return sum + calculateTotalCurrency(current, server); // Fix!
							else
								return sum;
						}, 0);
						let tempPulls = Math.floor((+yourCurrency + tableCurrency)/160) + +yourPulls;
						let tempCurrency = +yourCurrency + +yourPulls*160 + tableCurrency;
						let refunds = pullRefunds(props.json.id as ("3rd" | "genshin" | "hsr" | "zzz" | "wuwa"), Math.floor(excludedPullablesCurrency/160) + +yourPulls + Math.floor(+yourCurrency/160));
						switch(refund){
							case "1":
								tempPulls += refunds.best;
								tempCurrency += refunds.best*160;
								break;
							case "2":
								tempPulls += refunds.average;
								tempCurrency += refunds.average*160;
								break;
							case "3":
								tempPulls += refunds.worst;
								tempCurrency += refunds.worst*160;
								break;
							case "0":
							default:
								break;
						}
						// console.log(tempPulls);
						// console.log(refunds);
						
						let { pulls, currency } = addPity(tempPulls, tempCurrency, index, pullsFromSelectedPullables);
						return(
							<div key={`planned-${index}`}>
								<span>
									{`${item.name}: `}
								</span>
								<span className={`${pulls > 0 ? "text-green-500" : pulls < 0 ? "text-red-500" : ""}`}>
									{pulls>0?`+${pulls} (+${currency})`:`${pulls} (${currency})`}
								</span>
							</div>
						);
					})}
				</div>
				<div className="mt-[16px]" ref={tableRef}>
					{predictPlayerOutcome(pullsFromSelectedPullables)}
				</div>
			</div>
			<PlannerTable
				json={props.json}
				config={config}
				monthlyPassState={[monthlyPass, setMonthlyPass]}
				// pullsFromTableState={[pullsFromTable, setPullsFromTable]}
				savedItems={[savedItems, setSavedItems]}
				combinedData={[combinedData, setCombinedData]}
				pullsFromSelectedPullablesState={[pullsFromSelectedPullables, setPullsFromSelectedPullables]}
				selectedPullablesState={[selectedPullables, setSelectedPullables]}
				esteemedLuck={esteemedLuck}
			/>
		</div>
	);
}

export default Planner;