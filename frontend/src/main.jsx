import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { Login } from './components/Login/Login'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute.jsx'
import { Home } from './components/Home/Home.jsx'
import { Dashboard } from './components/Dashboard/Dashboard.jsx'
import './App.css'
import { Notes } from './components/Notes/Notes'

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
					path: '/dashboard/:dashboardId',
					element: (
						<ProtectedRoute>
							<Dashboard />
						</ProtectedRoute>
					),
					children: [
						{
							path: 'todo',
							element: <>ToDo content</>,
						},
						{
							path: 'notes',
							element: <Notes />,
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
