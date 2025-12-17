import { useEffect, useState } from "react";
import InfoTooltip from "./InfoTooltip";
import CookieBanner from "./CookieBanner";

function Settings() {
	// const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);

	useEffect(() => {
		let pullPlannerFromStorage = localStorage.getItem("pullplanner");
		if(pullPlannerFromStorage){
			let pullPlanner = JSON.parse(pullPlannerFromStorage);
			if(!pullPlanner.settings?.server) {
				pullPlanner.settings = {...pullPlanner.settings, server: "America"};
			}
			localStorage.setItem("pullplanner", JSON.stringify(pullPlanner));
		}
	}, []);

	const serverHandler = (event: React.ChangeEvent<HTMLSelectElement>) => {
		let pullPlannerFromStorage = localStorage.getItem("pullplanner");
		if(pullPlannerFromStorage){
			let pullPlanner = JSON.parse(pullPlannerFromStorage);
			pullPlanner.settings = {...pullPlanner.settings, server: event.target.value};
			localStorage.setItem("pullplanner", JSON.stringify(pullPlanner));
		}
	}

	return (
		<div className="mx-auto w-full">
			<div className="table-customization bg-table-primary max-w-sm md:max-w-[500px] mx-auto mt-[32px]">
				<div className="text-center font-bold mb-[10px]">Settings</div>
				<div className="flex items-center flex-col">
					<div>
						<div className="flex items-center mb-[4px]">
							<label htmlFor="server">
								Your server
							</label>
							<InfoTooltip text="Slight changes in the table times, but the site works with any server." />
						</div>
						<select id="server" onChange={serverHandler} defaultValue={JSON.parse(localStorage.getItem("pullplanner")!)?.settings?.server || "America"}>
							<option value={"America"}>America</option>
							<option value={"Europe"}>Europe</option>
							<option value={"Asia"}>Asia</option>
						</select>
					</div>
					{/* <div className="mt-4">
						<div className="flex items-center mb-[4px] flex-col">
							<label htmlFor="consent">
								Ads cookie consent
							</label>
						</div>
						<button id="consent" onClick={() => {setCookieConsent(false)}}>Change</button>
					</div> */}
				</div>
			</div>
			{/* {(cookieConsent!==null && cookieConsent===false) && <CookieBanner setCookieConsent={setCookieConsent} />} */}
		</div>
	)
}

export default Settings;