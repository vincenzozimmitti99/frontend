type CookieBannerProps = {
	setCookieConsent: React.Dispatch<React.SetStateAction<boolean | null>>
}

function CookieBanner(props: CookieBannerProps) {
	return (
		<div id="cookie-banner" className="fixed bottom-0 left-0 w-full border-t-1 bg-table-primary text-white p-4 flex justify-between items-center" style={{borderColor: "#696969"}}>
			<span>We use cookies for personalized ads. Do you consent?</span>
			<div className="flex space-x-2">
				<button id="accept" className="px-3 py-1 rounded" onClick={() => {props.setCookieConsent(true); localStorage.setItem("cookieConsent", "true");}}>Accept</button>
				<button id="reject" className="px-3 py-1 rounded" onClick={() => {props.setCookieConsent(true); localStorage.setItem("cookieConsent", "false");}}>Reject</button>
			</div>
		</div>
	)
}

export default CookieBanner;