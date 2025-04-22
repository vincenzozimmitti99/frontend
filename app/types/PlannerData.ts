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
	resetsEvery: number
}

export interface EndgameIncomeVariantHSR extends Income {
	resetStart: string,
	resetInterval: number
}

export type EndgameIncome = EndgameIncomeVariantGenshin | EndgameIncomeVariantHSR

export type Pullable = {
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
	end: Date,
	calculationStart: Date
}

export type ExtendedPullable = Omit<Pullable, "start"|"end"> & {
	start: Date,
	end: Date,
	value: number,
	rank: number
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