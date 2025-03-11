export type Product = {
	_id: string
	name: string
	category: string
	unit: string
	price: string
	tags: string
	isFavourite?: boolean
}

export type ShoppingItem = {
	productId: Product
	quantity: string
	notes: string
	customUnit: string
	customPrice: string
	isPurchased: boolean
	_id: string
}

export type IsShoppingPurchased = {
	isPurchased: boolean
}

export type ShoppingListType = {
	_id: string
	name: string
	list: ShoppingItem[]
	updatedAt: string
}

export type ShoppingListsType = ShoppingListType[]

export type ShoppingItemToUpdate = Omit<ShoppingItem, '_id'>

export type ShoppingProductProps = {
	data: ShoppingItem
	onListItemUpdate: (_id: string, data: ShoppingItemToUpdate | IsShoppingPurchased) => Promise<void>
	onListItemDelete: (_id: string) => void
}