import { useLoaderData } from 'react-router-dom'

export function ShoppingList() {
	const data = useLoaderData()

	return <div>{data.name}</div>
}
