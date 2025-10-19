import { useState } from "react";

function InfoTooltip({ text }: { text: string }) {
	const [visible, setVisible] = useState(false);

	return (
		<div className="relative inline-block ml-[2px]">
		<span 
			className="cursor-pointer text-gray-500" 
			onClick={() => setVisible((v) => !v)}
		>
			<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="size-6">
				<path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
			</svg>
		</span>
		{visible && (
			<div className="absolute z-10 tooltip-customization p-2 text-white text-sm rounded shadow-md mt-1 w-40 font-normal">
				{text}
			</div>
		)}
		</div>
	);
}

export default InfoTooltip;