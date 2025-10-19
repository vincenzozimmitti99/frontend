export interface PullablesJSON {
    characters: BaseJSONPullable[];
    weapons:    BaseJSONPullable[];
}

export interface BaseJSONPullable {
    id:   string;
    name: string;
}

export interface Income {
	name: string;
	recurrence: number;
	value: number;
}

export interface RegularIncome extends Income {
	type: string;
	resetDay?: number
}

export interface OtherIncome extends Income {
	start: string;
	end?: string;
}

export interface EndgameIncomeVariantGenshin extends Income {
	resetsEvery: number,
	resetDate?: string
}

export interface EndgameIncomeVariantHSR extends Income {
	resetStart: string,
	resetInterval: number
}

export type EndgameIncome = EndgameIncomeVariantGenshin | EndgameIncomeVariantHSR

export type Pullable = {
	id: string;
	name: string;
	type: string;
	start: string;
	end: string;
	version: string;
}

export type ExtendedIncome = Income & {
	start: Date,
	end: Date
}

export type ExtendedRegularIncome = RegularIncome & {
	start: Date,
	end: Date,
	calculationStart: Date
}

export type ExtendedPullable = Omit<Pullable, "start"|"end"> & {
	start: Date,
	end: Date,
	value: number,
	rank: number
}

export type SelectedPullablesGroup = {
	name: string;
	pullables: ExtendedPullable[];
	data: (ExtendedPullable | OtherIncome | ExtendedIncome | ExtendedRegularIncome)[];
}

export type MonthlyPass = {
	enabled: boolean,
	always: boolean,
	endDate: string | null
}

export type SavedItem = {
	name: string,
	disabled: boolean,
	rank?: number
}

export interface PlannerData {
	id: string;
	regularIncome: Income[];
	endgameIncome: EndgameIncome[];
	otherIncome: OtherIncome[];
	pullables: Pullable[];
}

const games = ["3rd", "genshin", "hsr", "zzz", "wuwa"] as const;
export type Games = typeof games[number];

const servers = ["Europe", "America", "Asia"] as const;
export type Server = typeof servers[number];

export const isEndgameIncome = (item: any): item is EndgameIncomeVariantGenshin | EndgameIncomeVariantHSR => {
	return isEndgameIncomeVariantGenshin(item) || isEndgameIncomeVariantHSR(item);
}

export const isEndgameIncomeVariantGenshin = (income: EndgameIncome): income is EndgameIncomeVariantGenshin => {
	return (income as EndgameIncomeVariantGenshin).resetsEvery !== undefined;
}

export const isEndgameIncomeVariantHSR = (income: EndgameIncome): income is EndgameIncomeVariantHSR => {
	return (income as EndgameIncomeVariantHSR).resetStart !== undefined &&
		(income as EndgameIncomeVariantHSR).resetInterval !== undefined;
}

export const isRegularIncome = (item: any): item is RegularIncome => {
	return (item as RegularIncome).type === "daily" || (item as RegularIncome).type === "premium" || (item as RegularIncome).type === "weekly" || (item as RegularIncome).type === "monthly";
}

export const isPullable = (item: any): item is Pullable => {
	return (item as Pullable).type === "character" || (item as Pullable).type === "weapon";
}

export const isExtendedPullable = (item: any): item is ExtendedPullable => {
	return isPullable(item as ExtendedPullable) && (item as ExtendedPullable).value !== undefined && (item as ExtendedPullable).rank !== undefined;
}