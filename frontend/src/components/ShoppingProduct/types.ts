import { IsShoppingPurchased, ShoppingItem } from '../../screens/Shopping/ShoppingList'

export type ShoppingItemToUpdate = Omit<ShoppingItem, '_id'>

export type ShoppingProductProps = {
	data: ShoppingItem
	onListItemUpdate: (_id: string, data: ShoppingItemToUpdate | IsShoppingPurchased) => Promise<void>
	onListItemDelete: (_id: string) => void
}
