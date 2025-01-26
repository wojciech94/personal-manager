import { createBrowserRouter, RouterProvider, LoaderFunctionArgs } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { API_URL } from './config'
import { Login } from './components/Login/Login'
import { Home } from './components/Home/Home'
import { Dashboard } from './components/Dashboard/Dashboard'
import './App.css'
import { Notes } from './components/Notes/Notes'
import { Folders } from './components/Folders/Folders'
import { Todos } from './components/Todos/Todos'
import { Shopping } from './components/Shopping/Shopping'
import { ShoppingLists } from './components/ShoppingLists/ShoppingLists'
import { Products } from './components/Products/Products'
import { ShoppingList } from './components/ShoppingList/ShoppingList'
import { GlobalError } from './components/GlobalError/GlobalError'
import { Notifications } from './components/Notifications/Notifications'

export type ApiError = {
	message: string
}

const Main = () => {
	const router = createBrowserRouter([
		{
			path: '/',
			element: <Home />,
			children: [
				{
					path: '/dashboards/:dashboardId',
					element: <Dashboard />,
					children: [
						{
							path: 'calendar',
							element: <>Calendar content work in progress</>,
						},
						{
							path: 'todo',
							element: <Todos />,
						},
						{
							path: 'folders',
							element: <Folders />,
							loader: async ({ params }: LoaderFunctionArgs) => {
								const { dashboardId } = params
								const token = localStorage.getItem('token')

								if (!token) {
									throw new Error('No token found')
								}

								const response = await fetch(`${API_URL}dashboards/${dashboardId}/folders`, {
									headers: {
										Authorization: `Bearer ${token}`,
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
							},
							children: [
								{
									path: 'notes/:folderId?',
									element: <Notes />,
									loader: async ({ params }: LoaderFunctionArgs) => {
										const { dashboardId, folderId } = params
										const token = localStorage.getItem('token')

										if (!token) {
											throw new Error('No token found')
										}

										const folderUrl = folderId ? `/${folderId}` : ''

										const response = await fetch(`${API_URL}dashboards/${dashboardId}/folders/notes${folderUrl}`, {
											headers: {
												Authorization: `Bearer ${token}`,
											},
										})

										if (!response.ok) {
											const ErrorMessage: ApiError = await response.json()
											throw new Error(ErrorMessage.message)
										}

										return response.json()
									},
								},
							],
						},
						{
							path: 'shopping',
							element: <Shopping />,
							children: [
								{
									path: 'list',
									element: <ShoppingLists />,
									children: [
										{
											path: ':shoppingListId',
											element: <ShoppingList />,
											loader: async ({ params }: LoaderFunctionArgs) => {
												const { shoppingListId } = params
												const token = localStorage.getItem('token')
												const response = await fetch(`${API_URL}shopping-lists/${shoppingListId}`, {
													headers: {
														Authorization: `bearer ${token}`,
													},
												})
												if (!response.ok) {
													const ErrorMessage: ApiError = await response.json()
													throw new Error(ErrorMessage.message)
												}
												const data: ShoppingList = await response.json()
												return data
											},
										},
									],
								},
								{
									path: 'products',
									element: <Products />,
								},
							],
						},
						{
							path: 'linktree',
							element: <>Linktree content work in progress</>,
						},
					],
				},
				{
					path: 'notifications',
					element: <Notifications />,
				},
				{
					path: 'settings',
					element: <div>Settings work in progress</div>,
				},
			],
			errorElement: <GlobalError />,
		},
		{
			path: '/login',
			element: <Login />,
		},
	])

	return <RouterProvider router={router} />
}

const rootElement = document.getElementById('root')
if (rootElement) {
	ReactDOM.createRoot(rootElement).render(<Main />)
} else {
	console.error('Element with id "root" not found')
}
