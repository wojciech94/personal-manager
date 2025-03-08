import { ShoppingList } from './../screens/Shopping/ShoppingList'
import { API_URL } from './../config'
import { LoaderFunctionArgs } from 'react-router-dom'
import { ApiError } from '../types/global'
import { NoteType } from '../components/Note/types'

export const fetchFolders = async ({ params }: LoaderFunctionArgs, accessToken: string | null) => {
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

	return response.json()
}

export const fetchShoppingList = async ({ params }: LoaderFunctionArgs, accessToken: string | null) => {
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

export const fetchNotes = async ({ params }: LoaderFunctionArgs, accessToken: string | null): Promise<NoteType[]> => {
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
		const errorMessage: ApiError = await response.json()
		throw new Error(errorMessage.message)
	}

	return response.json() as Promise<NoteType[]>
}
