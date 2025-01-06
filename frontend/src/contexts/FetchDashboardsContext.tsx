import { createContext } from 'react'

interface FetchDashboardsContextType {
	fetchUserDashboards: () => Promise<void>
}

export const FetchDashboardsContext = createContext<FetchDashboardsContextType | null>(null)
