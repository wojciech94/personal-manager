import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { API_URL } from './config'
import { Login } from './components/Login/Login'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx'
import { Home } from './components/Home/Home.jsx'
import { Dashboard } from './components/Dashboard/Dashboard.jsx'
import './App.css'
import { Notes } from './components/Notes/Notes'
import { Folders } from './components/Folders/Folders'
import { Todos } from './components/Todos/Todos'
import { Shopping } from './components/Shopping/Shopping'
import { ShoppingLists } from './components/ShoppingLists/ShoppingLists'
import { Products } from './components/Products/Products'
import { ShoppingList } from './components/ShoppingList.jsx/ShoppingList'

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
							loader: async ({ params }) => {
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
									throw new Error('Failed to load folders')
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
									loader: async ({ params }) => {
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
											throw new Error('Failed to load folders')
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
											loader: async ({ params }) => {
												const { shoppingListId } = params
												const token = localStorage.getItem('token')
												const res = await fetch(`${API_URL}shopping-lists/${shoppingListId}`, {
													headers: {
														Authorization: `bearer ${token}`,
													},
												})
												if (res.ok) {
													const data = await res.json()
													return data
												} else {
													const errorMessage = await res.json()
													console.error(errorMessage.message)
												}
											},
										},
									],
								},
								{
									path: 'products',
									element: <Products />,
								},
								{
									path: 'receipts',
									element: <>Receipts</>,
								},
							],
						},
						{
							path: 'linktree',
							element: <>Linktree content work in progress</>,
						},
					],
				},
			],
		},
		{
			path: '/login',
			element: <Login />,
		},
	])

	return <RouterProvider router={router} />
}

ReactDOM.createRoot(document.getElementById('root')).render(<Main />)
