import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import { Login } from './screens/Login'
import { Home } from './components/Home/Home'
import { PageWrapper } from './components/PageWrapper/PageWrapper'
import './App.css'
import { Notes } from './screens/Notes/Notes'
import { Folders } from './screens/Notes/Folders'
import { Todos } from './screens/Todos'
import { Shopping } from './screens/Shopping/Shopping'
import { ShoppingLists } from './screens/Shopping/ShoppingLists'
import { Products } from './screens/Shopping/Products'
import { ShoppingList } from './screens/Shopping/ShoppingList'
import { GlobalError } from './components/GlobalError/GlobalError'
import { Notifications } from './components/Notifications/Notifications'
import { ApiProvider, useApi } from './contexts/ApiContext'
import { Posts } from './screens/Posts'
import { Dashboard } from './screens/Dashboard'
import { fetchFolders, fetchNotes, fetchShoppingList } from './loaders/loaders'

const Main = () => {
	const { accessToken } = useApi()
	const router = createBrowserRouter([
		{
			path: '/',
			element: <Home />,
			children: [
				{
					path: '/dashboards/:dashboardId',
					element: <PageWrapper />,
					children: [
						{
							path: '',
							element: <Dashboard />,
						},
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
							loader: args => fetchFolders(args, { accessToken }),

							children: [
								{
									path: 'notes/:folderId?',
									element: <Notes />,
									loader: args => fetchNotes(args, { accessToken }),
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
											loader: args => fetchShoppingList(args, { accessToken }),
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
							path: 'posts',
							element: <Posts />,
						},
					],
				},
				{
					path: 'notifications',
					element: <Notifications />,
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

const rootElement = document.getElementById('root') as HTMLElement
ReactDOM.createRoot(rootElement).render(
	<ApiProvider>
		<Main />
	</ApiProvider>
)
