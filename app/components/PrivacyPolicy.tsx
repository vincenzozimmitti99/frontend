function PrivacyPolicy() {
	return (
		<div className="mx-auto w-full">
			<header className="shadow">
				<div className="max-w-4xl mx-auto px-4 py-6">
					<h1 className="text-2xl font-bold">Privacy Policy</h1>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
				<section>
					<p>At <strong>Pull Planner</strong> (accessible from <a href="https://www.pull-planner.com" className="underline">pull-planner.com</a>), your privacy is important to us.</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">1. Information</h2>
					<p>We do not collect personal information from our visitors. Any information that may be temporarily stored stays in the user's browser and is not collected by us directly.</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">2. Google AdSense</h2>
					<p>We use <strong>Google AdSense</strong> to display ads on our website.</p>
					<ul className="list-disc ml-6 mt-2 space-y-1">
						<li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to your website or other websites.</li>
						<li>Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet.</li>
						<li>Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="underline">Ads Settings</a>. (Alternatively, you can direct users to opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices" className="underline">www.aboutads.info</a>.)</li>
					</ul>
					<p className="mt-2">For more information, see <a href="https://policies.google.com/technologies/ads" className="underline">Google's Privacy & Terms</a>.</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">3. Third-Party Privacy Policies</h2>
					<p>This Privacy Policy does not apply to other advertisers or websites. We encourage users to review the privacy policies of these third-party ad servers for more details.</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">4. GDPR (if applicable)</h2>
					<p>If you are a resident of the European Economic Area (EEA), you have the right to limit personalized advertising. You can opt out via <a href="https://www.google.com/settings/ads" className="underline">Google Ads Settings</a>.</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">5. Children</h2>
					<p>We do not knowingly collect information from children under 13.</p>
				</section>

				<section className="mt-8">
					<p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>
				</section>

			</main>
		</div>
	)
}

export default PrivacyPolicy;