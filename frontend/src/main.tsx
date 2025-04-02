import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
import './App.css'
import { Login } from './screens/Login'
import { Home } from './screens/Home'
import { PageWrapper } from './components/PageWrapper/PageWrapper'
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
import { TranslationProvider } from './contexts/TranslationContext'
import { Calendar } from './screens/Calendar/Calendar'
import { CalendarMonth } from './screens/Calendar/CalendarMonth'
import { CalendarWeek } from './screens/Calendar/CalendarWeek'
import { CalendarDay } from './screens/Calendar/CalendarDay'

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
							element: <Calendar />,
							children: [
								{
									path: '',
									element: (
										<Navigate
											to={`month/${new Date().getFullYear()}/${(new Date().getMonth() + 1)
												.toString()
												.padStart(2, '0')}`}
											replace
										/>
									),
								},
								{
									path: 'month/:year/:month',
									element: <CalendarMonth />,
								},
								{
									path: 'week/:year/:week',
									element: <CalendarWeek />,
								},
								{
									path: 'day/:year/:month/:day',
									element: <CalendarDay />,
								},
							],
						},
						{
							path: 'todo',
							element: <Todos />,
						},
						{
							path: 'folders',
							element: <Folders />,
							loader: args => fetchFolders(args, accessToken),
							children: [
								{
									path: 'notes/:folderId?',
									element: <Notes />,
									loader: args => fetchNotes(args, accessToken),
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
											loader: args => fetchShoppingList(args, accessToken),
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
	<TranslationProvider>
		<ApiProvider>
			<Main />
		</ApiProvider>
	</TranslationProvider>
)
