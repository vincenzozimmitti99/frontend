function TermsOfUse() {
	return (
		<div className="mx-auto w-full">
			<header className="shadow">
				<div className="max-w-4xl mx-auto px-4 py-6">
					<h1 className="text-2xl font-bold">Terms of Use</h1>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
				<section>
					<p>
						Welcome to <strong>Pull Planner</strong> (accessible from{" "}
						<a href="https://www.pull-planner.com" className="underline">
							pull-planner.com
						</a>
						). By accessing or using this website, you agree to comply with and
						be bound by these Terms of Use. If you do not agree with any part of
						these Terms, please do not use this site.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">1. Use of the Website</h2>
					<p>
						You agree to use this website only for lawful purposes and in a way
						that does not infringe the rights of, restrict, or inhibit anyone
						else’s use and enjoyment of the site. You may not use this site to
						transmit or distribute spam, malware, or engage in any activity that
						could harm the website or its users.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">
						2. Intellectual Property and Fair Use
					</h2>
					<p className="mb-2">
						This website is an independent fan project and is not affiliated
						with, endorsed by, or sponsored by HoYoverse or miHoYo Co., Ltd.
					</p>
					<p className="mb-2">
						All trademarks, game titles, characters, images, and other related
						materials are the property of their respective owners. Genshin
						Impact™, Honkai: Star Rail™, and Zenless Zone Zero™ are trademarks
						of COGNOSPHERE PTE. LTD. / miHoYo Co., Ltd.
					</p>
					<p>
						Images and references from these games are used under fair use for
						commentary and informational purposes only.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">
						3. Disclaimer of Liability
					</h2>
					<p>
						The information provided on this website is for general informational
						purposes only. While we strive to ensure accuracy, we make no
						warranties or representations regarding completeness, reliability,
						or accuracy. Any reliance you place on such information is strictly
						at your own risk.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">4. External Links</h2>
					<p>
						This website may contain links to third-party websites or services
						that are not owned or controlled by us. We have no responsibility
						for the content, privacy policies, or practices of any third-party
						sites or services.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">5. Changes to These Terms</h2>
					<p>
						We may update or modify these Terms of Use at any time without prior
						notice. Updates take effect immediately upon posting on this page.
						Your continued use of the site after any changes constitutes
						acceptance of the revised Terms.
					</p>
				</section>

				<section>
					<h2 className="text-xl font-semibold mt-4">6. Contact</h2>
					<p>
						If you have any questions about these Terms, please contact us at{" "}
						<a href="mailto:youremail@example.com" className="underline">
							youremail@example.com
						</a>
						.
					</p>
				</section>

				<section className="mt-8">
					<p>
						By using this website, you acknowledge that you have read,
						understood, and agree to these Terms of Use.
					</p>
				</section>
			</main>
		</div>
	);
}

export default TermsOfUse;