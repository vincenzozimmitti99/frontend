import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	layout("routes/_layout.tsx", [
		index("routes/home.tsx"),
		// route("/honkai-impact-3rd", "routes/honkai-impact-3rd.tsx"),
		route("/genshin-impact", "routes/genshin-impact.tsx"),
		route("/honkai-star-rail", "routes/honkai-star-rail.tsx"),
		route("/zenless-zone-zero", "routes/zenless-zone-zero.tsx"),
		route("/settings", "routes/settings.tsx"),
		route("/about", "routes/about.tsx"),
		route("/privacy-policy", "routes/privacy-policy.tsx"),
		route("/terms-of-use", "routes/terms-of-use.tsx")
	])
] satisfies RouteConfig;
