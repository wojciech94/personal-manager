import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { Login } from './components/Login/Login'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx'
import { Home } from './components/Home/Home.jsx'
import { Dashboard } from './components/Dashboard/Dashboard.jsx'
import './App.css'
import { Notes } from './components/Notes/Notes'
import { Folders } from './components/Folders/Folders'
import { Todos } from './components/Todos/Todos'

const Main = () => {
	const router = createBrowserRouter([
		{
			path: '/',
			element: (
				<ProtectedRoute>
					<Home />
				</ProtectedRoute>
			),
			children: [
				{
					path: '/dashboards/:dashboardId',
					element: (
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					),
					children: [
						{
							path: 'calendar',
							element: <>Calendar content</>,
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

								const response = await fetch(`http://localhost:5000/dashboards/${dashboardId}/folders`, {
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

										const response = await fetch(
											`http://localhost:5000/dashboards/${dashboardId}/folders/notes${folderUrl}`,
											{
												headers: {
													Authorization: `Bearer ${token}`,
												},
											}
										)

										if (!response.ok) {
											throw new Error('Failed to load folders')
										}

										return response.json()
									},
								},
							],
						},
						{
							path: 'shoppinglist',
							element: <>Shopping content</>,
						},
						{
							path: 'linktree',
							element: <>Linktree content</>,
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
