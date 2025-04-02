export const CATEGORIES = [
	{
		name: 'Other',
		value: 'other',
	},
	{
		name: 'Vegetables',
		value: 'vegetables',
	},
	{
		name: 'Fruits',
		value: 'fruits',
	},
	{
		name: 'Alcohol',
		value: 'alcohol',
	},
	{
		name: 'Bakery',
		value: 'bakery',
	},
	{
		name: 'Cereal',
		value: 'cereal',
	},
	{
		name: 'Tea & Coffee',
		value: 'teaCoffee',
	},
	{
		name: 'Fish',
		value: 'fish',
	},
	{
		name: 'Dairy',
		value: 'dairy',
	},
	{
		name: 'Pasta',
		value: 'pasta',
	},
	{
		name: 'Meat',
		value: 'meat',
	},
	{
		name: 'Snacks',
		value: 'snacks',
	},
	{
		name: 'Sweets',
		value: 'sweets',
	},
	{
		name: 'Spices',
		value: 'spices',
	},
	{
		name: 'House cleaning',
		value: 'houseCleaning',
	},
	{
		name: 'Hygiene',
		value: 'hygiene',
	},
] as const

export const WELCOME_SLIDES = [
	{ key: 'saveNotes', class: 'gradient-0', background: 'linear-gradient(125deg, #efa8a8aa, #ebbea6aa)' },
	{ key: 'planTasks', class: 'gradient-1', background: 'linear-gradient(125deg, #a8efa8aa, #beeba6aa)' },
	{ key: 'createShoppingList', class: 'gradient-2', background: 'linear-gradient(125deg, #a8a8efaa, #bea6ebaa)' },
	{ key: 'shareDashboards', class: 'gradient-4', background: 'linear-gradient(125deg, #bea6ebaa, #a6beebaa)' },
] as const

export type WelcomeSlideKey = (typeof WELCOME_SLIDES)[number]['key']
