import type { PlannerData } from "~/types/PlannerData";

export type PlannerTableProps = React.HTMLProps<HTMLDivElement> & {
	json: PlannerData;
	pullsFromTableState: [number, React.Dispatch<React.SetStateAction<number>>];
	esteemedLuck: string;
};