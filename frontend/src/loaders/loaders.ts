import { ShoppingList } from './../screens/Shopping/ShoppingList'
import { ApiError } from './../main'
import { API_URL } from './../config'
import { LoaderFunctionArgs } from 'react-router-dom'

export const fetchFolders = async ({ params }: LoaderFunctionArgs, { accessToken }: { accessToken: String | null }) => {
	const { dashboardId } = params

	if (!accessToken) {
		throw new Error('No token found')
	}

	const response = await fetch(`${API_URL}dashboards/${dashboardId}/folders`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	})

	if (!response.ok) {
		const ErrorMessage: ApiError = await response.json()
		throw new Error(ErrorMessage.message)
	}

	if (response.status === 204) {
		return []
	}

	return response.json()
}

export const fetchShoppingList = async (
	{ params }: LoaderFunctionArgs,
	{ accessToken }: { accessToken: String | null }
) => {
	const { shoppingListId } = params

	const response = await fetch(`${API_URL}shopping-lists/${shoppingListId}`, {
		headers: {
			Authorization: `bearer ${accessToken}`,
		},
	})
	if (!response.ok) {
		const ErrorMessage: ApiError = await response.json()
		throw new Error(ErrorMessage.message)
	}
	const data: ShoppingList = await response.json()
	return data
}

export const fetchNotes = async ({ params }: LoaderFunctionArgs, { accessToken }: { accessToken: String | null }) => {
	const { dashboardId, folderId } = params

	if (!accessToken) {
		throw new Error('No token found')
	}

	const folderUrl = folderId ? `/${folderId}` : ''

	const response = await fetch(`${API_URL}dashboards/${dashboardId}/folders/notes${folderUrl}`, {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	})

	if (!response.ok) {
		const ErrorMessage: ApiError = await response.json()
		throw new Error(ErrorMessage.message)
	}

	return response.json()
}
