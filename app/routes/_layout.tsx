import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import CookieBanner from "~/components/CookieBanner";
import Navbar from "~/components/Navbar";

function _layout() {
	const [cookieConsent, setCookieConsent] = useState<boolean | null>(null);

	useEffect(() => {
		const storage = localStorage.getItem("cookieConsent");
		if(!storage)
			setCookieConsent(false);
	}, []);

	return (
		<div className="flex h-full">
			<Navbar />
			<div className="content-container">
				<Outlet />
				{/* {(cookieConsent!==null && cookieConsent===false) && <CookieBanner setCookieConsent={setCookieConsent} />} */}
			</div>
		</div>
	)
}

export default _layout;