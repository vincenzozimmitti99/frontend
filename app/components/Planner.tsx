import type { ExtendedPullable, MonthlyPass, PlannerData } from "~/types/PlannerData";
import hsrJSON from "../assets/json/hsr.json";

import { useEffect, useState } from "react";
import PlannerTable from "./PlannerTable";

type Games = ["3rd", "genshin", "hsr", "zzz", "wuwa"];

const jsons: Record<Games[number], PlannerData> = {"3rd": hsrJSON, "genshin": hsrJSON, "hsr": hsrJSON, "zzz": hsrJSON, "wuwa": hsrJSON}; // Change this later

type PlannerProps = React.HTMLProps<HTMLDivElement> & {
	game: keyof typeof jsons
}

export interface Config{
    currency: string;
    pulls: string;
    th3: string;
	rankCharacter: string;
	rankWeapon: string;
	monthlyPass: string;
}

const loadConfig = (id: string) => {
	let config: Config;

	switch(id){
		case "3rd": // Fix
			config = {
				currency: "",
				pulls: "",
				th3: "Pulls ()",
				rankCharacter: "",
				rankWeapon: "",
				monthlyPass: ""
			};
			break;
		case "genshin":
			config = {
				currency: "Primogems",
				pulls: "Intertwined Fates",
				th3: "Pulls (Primogems)",
				rankCharacter: "Constellation",
				rankWeapon: "Rank",
				monthlyPass: "Express Supply Pass"
			};
			break;
		case "hsr":
			config = {
				currency: "Stellar Jades",
				pulls: "Star Rail Special Passes",
				th3: "Pulls (Jades)",
				rankCharacter: "Eidolon",
				rankWeapon: "Superimpose",
				monthlyPass: "Express Supply Pass"
			};
			break;
		case "zzz":
			config = {
				currency: "Polychromes",
				pulls: "Encrypted Master Tapes",
				th3: "Pulls (Polychromes)",
				rankCharacter: "Mindscape Cinema",
				rankWeapon: "Overclock?",
				monthlyPass: "Express Supply Pass"
			};
			break;
		case "wuwa":
			config = {
				currency: "Astrites",
				pulls: "Radiant Tides",
				th3: "Pulls (Astrites)",
				rankCharacter: "",
				rankWeapon: "",
				monthlyPass: "Express Supply Pass"
			};
			break;
		default:
			config = {
				currency: "currency",
				pulls: "pulls",
				th3: "Pulls (currency)",
				rankCharacter: "",
				rankWeapon: "",
				monthlyPass: "Monthly Pass"
			};
			break;
	};

	return config;
};

function Planner(props: PlannerProps){
	const [yourJades, setYourJades] = useState("0");
	const [yourTickets, setYourTickets] = useState("0");
	const [pullsFromTable, setPullsFromTable] = useState(0);
	const [esteemedLuck, setEsteemedLuck] = useState("50");
	const [monthlyPass, setMonthlyPass] = useState<MonthlyPass>({enabled: false, always: false, endDate: null});
	const [totalPulls, setTotalPulls] = useState(0);

	const [selectedPullables, setSelectedPullables] = useState<ExtendedPullable[]>([]);
	const [pullsFromSelectedPullables, setPullsFromSelectedPullables] = useState<{ name: string; pullCount: number; }[]>([]);

	const inputChangeHandle = (event: React.ChangeEvent<HTMLInputElement>, setState: React.Dispatch<React.SetStateAction<string>>) => {
		const value = event.target.value;
		setState(value);
	};

	const yourJadesHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
	
		if(/^\d*$/.test(value) && value.length<10){
			setYourJades(value);
		}
	};

	const yourTicketsHandle = (event: React.ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
	
		if(/^\d*$/.test(value) && value.length<6){
			setYourTickets(value);
		}
	};

	useEffect(() => {
		let result = Math.floor((+yourJades/160) + +yourTickets + pullsFromTable);
		setTotalPulls(result);
	}, [yourJades, yourTickets, pullsFromTable]);

	let config = loadConfig(props.game);

	return(
		<div className="mx-auto">
			<div className="flex">
				<span>Your {config.currency}: </span>
				<input type="text" className="text-right" value={yourJades} onChange={yourJadesHandle} />
			</div>
			<div className="flex">
				<span>Your {config.pulls}: </span>
				<input type="text" className="text-right" value={yourTickets} onChange={yourTicketsHandle} />
			</div>
			<div className="flex">
				<span>{config.monthlyPass}: </span>
				<label><input type="checkbox" checked={monthlyPass.enabled} onChange={() => {setMonthlyPass((prev) => {return {...prev, enabled: !prev.enabled}})}} />Enabled</label>
				<label><input type="checkbox" checked={monthlyPass.always} disabled={!monthlyPass.enabled} onChange={() => {setMonthlyPass((prev) => {return {...prev, always: !prev.always}})}} />Always</label>
				<label>End date: <input type="text" className="text-right" value={monthlyPass.endDate || ""} disabled={monthlyPass.always || !monthlyPass.enabled} onChange={(event) => {setMonthlyPass((prev) => {return {...prev, endDate: event.target.value}})}} /></label>
			</div>
			<div className="flex">
				<span>Esteemed luck: </span>
				<input type="text" className="text-right" value={esteemedLuck} placeholder="0-100" onChange={(event) => {inputChangeHandle(event, setEsteemedLuck)}} />%
			</div>
			<div className="flex">
				<span>Total pulls:</span><span className={`${totalPulls > 0 ? "text-green-500" : totalPulls < 0 ? "text-red-500" : ""}`}>{totalPulls>0?`+${totalPulls}`:totalPulls}</span>
			</div>
			<div className="flex">
				<span>Selected pullables:</span>
				{selectedPullables.map((item) => {return <span>{item.name}</span>})}
			</div>
			<div className="flex">
				{pullsFromSelectedPullables.map((item) => {
					return <span>{`${item.name}: ${Math.floor(item.pullCount)}`}</span>
				})}
			</div>
			<PlannerTable
				json={jsons[props.game]}
				config={config}
				monthlyPassState={[monthlyPass, setMonthlyPass]}
				pullsFromTableState={[pullsFromTable, setPullsFromTable]}
				pullsFromSelectedPullablesState={[pullsFromSelectedPullables, setPullsFromSelectedPullables]}
				selectedPullablesState={[selectedPullables, setSelectedPullables]}
				esteemedLuck={esteemedLuck}
			/>
		</div>
	);
}

export default Planner;