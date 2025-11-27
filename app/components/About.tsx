function About() {
	return (
		<div className="mx-auto w-full">
			<header className="border-b-1" style={{borderColor: "#696969"}}>
				<div className="max-w-4xl mx-auto px-4 py-6">
					<h1 className="text-2xl font-bold">About</h1>
				</div>
			</header>

			<main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
				<section>
					<p>
						<strong>Pull Planner</strong> is a fan-made site that helps you plan your next character pulls in HoYoverse's popular gacha games — currently <em>Genshin Impact</em>, <em>Honkai: Star Rail</em>, and <em>Zenless Zone Zero</em>.<br />
						To make planning as accurate as possible, the site uses the data of simulations of millions of users pulling at the respective game's gacha rates.
					</p>
				</section>

				<section>
					<p>To get started, you just need to put your current account situation and pick the character/weapon you want to pull. The site will tell you how many pulls you will have at the end of the phase — a positive number means you can get it during that time.<br/>
					Of course, this doesn't guarantee success, since by default the site assumes the <em>average</em> case. If you want to be sure to get everything, you should set <strong>5★ Esteemed Luck</strong> at the <strong>Worst case</strong>.</p>
				</section>

				<section>
					<p>For questions, feedback, or bug reports, contact us at <a className="underline" href="mailto:pullplanner@gmail.com">pullplanner@gmail.com</a></p>
				</section>
			</main>
		</div>
	)
}

export default About;