import { Outlet } from "react-router";
import Navbar from "~/components/Navbar";

function _layout() {
	return (
		<div className="flex h-full">
			<Navbar />
			<div className="content-container">
				<Outlet />
			</div>
		</div>
	)
}

export default _layout;