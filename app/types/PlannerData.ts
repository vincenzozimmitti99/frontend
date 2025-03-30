export interface Income {
	name: string;
	recurrence: number;
	value: number;
}

export interface RegularIncome extends Income {
	type: string;
	resetStart?: string,
	resetInterval?: number
}

export interface OtherIncome extends Income {
	start: string;
	end?: string;
}

export interface EndgameIncomeVariantGenshin extends Income {
	resetsEvery: number
}

export interface EndgameIncomeVariantHSR extends Income {
	resetStart: string,
	resetInterval: number
}

export type EndgameIncome = EndgameIncomeVariantGenshin | EndgameIncomeVariantHSR

export interface Pullable {
	name: string;
	type: string;
	start: string;
	end: string;
}

export type ExtendedIncome = Income & {
	start: Date,
	end: Date
}

export type ExtendedRegularIncome = RegularIncome & {
	start: Date,
	end: Date
}

export type ExtendedPullable = Pullable & {
	value: number,
	rank: number
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