import { createContext, useContext } from 'react'

interface FetchDashboardsContextType {
	fetchUserDashboards: () => Promise<void>
}

export const FetchDashboardsContext = createContext<FetchDashboardsContextType | null>(null)

export function useFetchDashboardsContext() {
	const context = useContext(FetchDashboardsContext)
	if (!context) throw Error('useFetchDashboard context can only be used inside FetchDashboardContextProvider')
	return context
}
