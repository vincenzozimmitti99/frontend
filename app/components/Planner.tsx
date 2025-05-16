import { type ExtendedPullable, type MonthlyPass, type PlannerData, type Games, type SelectedPullablesGroup, isExtendedPullable } from "~/types/PlannerData";
import genshinJSON from "../assets/json/genshin.json";
import hsrJSON from "../assets/json/hsr.json";

import { useEffect, useState } from "react";
import PlannerTable from "./PlannerTable";
import { calculateTotalCurrency, getStatisticalPullableValue } from "~/utils/common";

const jsons: Record<Games, PlannerData> = {"3rd": hsrJSON, "genshin": genshinJSON, "hsr": hsrJSON, "zzz": hsrJSON, "wuwa": hsrJSON}; // Change this later

type PlannerProps = React.HTMLProps<HTMLDivElement> & {
	game: keyof typeof jsons
}

export interface Config{
	game: string;
    currency: string;
    pulls: string;
	rankCharacter: string;
	rankWeapon: string;
	monthlyPass: string;
}

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
				monthlyPass: ""
			};
			break;
		case "genshin":
			config = {
				game: id,
				currency: "Primogems",
				pulls: "Intertwined Fates",
				rankCharacter: "Constellation",
				rankWeapon: "Rank",
				monthlyPass: "Express Supply Pass"
			};
			break;
		case "hsr":
			config = {
				game: id,
				currency: "Stellar Jades",
				pulls: "Star Rail Special Passes",
				rankCharacter: "Eidolon",
				rankWeapon: "Superimpose",
				monthlyPass: "Express Supply Pass"
			};
			break;
		case "zzz":
			config = {
				game: id,
				currency: "Polychromes",
				pulls: "Encrypted Master Tapes",
				rankCharacter: "Mindscape Cinema",
				rankWeapon: "Overclock?", // Fix this later
				monthlyPass: "Express Supply Pass"
			};
			break;
		case "wuwa":
			config = {
				game: id,
				currency: "Astrites",
				pulls: "Radiant Tides",
				rankCharacter: "",
				rankWeapon: "",
				monthlyPass: "Express Supply Pass"
			};
			break;
		default:
			config = {
				game: id,
				currency: "currency",
				pulls: "pulls",
				rankCharacter: "Character Rank",
				rankWeapon: "Weapon Rank",
				monthlyPass: "Monthly Pass"
			};
			break;
	};

	return config;
};

function Planner(props: PlannerProps){
	let config = loadConfig(props.game);

	const [yourCurrency, setYourCurrency] = useState("0");
	const [yourPulls, setYourPulls] = useState("0");
	const [characterPity, setCharacterPity] = useState("0");
	const [weaponPity, setWeaponPity] = useState("0");
	// const [pullsFromTable, setPullsFromTable] = useState(0);
	const [esteemedLuckDisabled, setEsteemedLuckDisabled] = useState(true);
	const [esteemedLuck, setEsteemedLuck] = useState("50");
	const [monthlyPass, setMonthlyPass] = useState<MonthlyPass>({enabled: false, always: false, endDate: null});

	const [selectedPullables, setSelectedPullables] = useState<ExtendedPullable[]>([]);
	const [pullsFromSelectedPullables, setPullsFromSelectedPullables] = useState<SelectedPullablesGroup[]>([]);

	const updateStorage = (propertyName: string, value: string | object) => {
		let pullPlannerFromStorage = localStorage.getItem("pullplanner");
		if(pullPlannerFromStorage){
			let pullPlanner = JSON.parse(pullPlannerFromStorage);
			pullPlanner[props.game][propertyName] = value;
			localStorage.setItem("pullplanner", JSON.stringify(pullPlanner));
			return true;
		}
		return false;
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
		let item = {...pullableGroups[pullableGroups.length-1]};
		let dataCopy = item.data.map(p => ({ ...p }));

		for(let pullable of dataCopy){
			if(isExtendedPullable(pullable)){
				pullable.value = -getStatisticalPullableValue(props.game, "99", pullable.type, pullable.rank)*160;
			}
		}

		let tableCurrency = dataCopy.reduce((sum, current) => {
			return sum + calculateTotalCurrency(current);
		}, 0)
		let tempPulls = Math.floor((+yourCurrency + tableCurrency)/160) + +yourPulls;
		let tempCurrency = +yourCurrency + +yourPulls*160 + tableCurrency;
		let { pulls, currency } = addPity(tempPulls, tempCurrency, pullableGroups.length-1, pullableGroups);
		console.log(pulls, currency);
		return "You will be able to pull the selected characters/weapons even in the worst case!";
	};

	useEffect(() => {
		const pullPlannerFromStorage = localStorage.getItem("pullplanner");
		if(pullPlannerFromStorage){
			let pullPlanner = JSON.parse(pullPlannerFromStorage);
			pullPlanner[props.game].yourCurrency?setYourCurrency(pullPlanner[props.game].yourCurrency):null;
			pullPlanner[props.game].yourPulls?setYourPulls(pullPlanner[props.game].yourPulls):null;
			pullPlanner[props.game].characterPity?setCharacterPity(pullPlanner[props.game].characterPity):null;
			pullPlanner[props.game].weaponPity?setWeaponPity(pullPlanner[props.game].weaponPity):null;
			pullPlanner[props.game].monthlyPass?setMonthlyPass(pullPlanner[props.game].monthlyPass):null;
		}
	}, []);

	// useEffect(() => {
	// 	let result = Math.floor(+yourCurrency + +yourPulls*160 + pullsFromTable);
	// 	setTotalPulls(result);
	// }, [yourCurrency, yourPulls, characterPity, weaponPity, pullsFromTable]);

	return(
		<div className="mx-auto">
			<div className="table-customization bg-table-primary max-w-sm mx-auto">
				<div className="text-center font-bold mb-2">Customization</div>
				<div className="form-group">
					<label>
						{"Your " + config.currency}
						<input type="text" className="text-right" value={yourCurrency} placeholder="0" onChange={yourCurrencyHandle} />
					</label>
				</div>
				<div className="form-group">
					<label>
						{"Your " + config.pulls}
						<input type="text" className="text-right" value={yourPulls} placeholder="0" onChange={yourPullsHandle} />
					</label>
				</div>
				<div className="form-group">
					<label>
						{"Character Banner Pity"}
						<input type="text" className="text-right" value={characterPity} placeholder="0" onChange={characterPityHandle} />
					</label>
				</div>
				<div className="form-group">
					<label>
						{"Weapon Banner Pity"}
						<input type="text" className="text-right" value={weaponPity} placeholder="0" onChange={weaponPityHandle} />
					</label>
				</div>
				<div className="form-group">
					<span className="cursor-default">{config.monthlyPass}</span>
					<div className="monthly-pass-checkboxes">
						<label className="form-checkbox">
							<input type="checkbox" checked={monthlyPass.enabled} onChange={() => {setMonthlyPass((prev) => {let newMonthlyPass = {...prev, enabled: !prev.enabled}; updateStorage("monthlyPass", newMonthlyPass); return newMonthlyPass})}} />
							Enabled
						</label>
						<label className="form-checkbox">
							<input type="checkbox" checked={monthlyPass.always} disabled={!monthlyPass.enabled} onChange={() => {setMonthlyPass((prev) => {return {...prev, always: !prev.always}})}} />
							Always
						</label>
					</div>
					<label>
						End date
						<input type="text" className="text-right" value={monthlyPass.endDate || ""} disabled={monthlyPass.always || !monthlyPass.enabled} onChange={(event) => {setMonthlyPass((prev) => {return {...prev, endDate: event.target.value}})}} placeholder="MM/dd/yyyy" />
					</label>
				</div>
				<div className="form-group">
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
				<div className="form-group">
					<label htmlFor="refund">
						{"Undying Starlight-- Refund"}
					</label>
					<div className="">
						<select defaultValue={1} className="select" id="refund" onChange={(event) => {}}>
							<option value={0}>None</option>
							<option value={1}>Best case</option>
							<option value={2}>Average case</option>
							<option value={3}>Worst case</option>
						</select>
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
				<div className="form-group">
					<label>
						{"Planned characters/weapons"}
					</label>
					{pullsFromSelectedPullables.map((item, index) => {
						let tableCurrency = item.data.reduce((sum, current) => {
							return sum + calculateTotalCurrency(current);
						}, 0)
						let tempPulls = Math.floor((+yourCurrency + tableCurrency)/160) + +yourPulls;
						let tempCurrency = +yourCurrency + +yourPulls*160 + tableCurrency;
						let { pulls, currency } = addPity(tempPulls, tempCurrency, index, pullsFromSelectedPullables);
						return(
							<div>
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
				<div className="form-group">
					{predictPlayerOutcome(pullsFromSelectedPullables)}
				</div>
				{/* Debug
				<div className="flex">
					<span>Selected pullables:</span>
					{selectedPullables.map((item) => {return <span>{item.name}</span>})}
				</div> */}
			</div>
			<PlannerTable
				json={jsons[props.game]}
				config={config}
				monthlyPassState={[monthlyPass, setMonthlyPass]}
				// pullsFromTableState={[pullsFromTable, setPullsFromTable]}
				pullsFromSelectedPullablesState={[pullsFromSelectedPullables, setPullsFromSelectedPullables]}
				selectedPullablesState={[selectedPullables, setSelectedPullables]}
				esteemedLuck={esteemedLuck}
			/>
		</div>
	);
}

export default Planner;