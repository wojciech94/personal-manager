import { createContext, useContext } from 'react'
import { ScreenType } from '../types/global'

export const ScreenContext = createContext<ScreenType | null>(null)

export function useScreenContext() {
	const context = useContext(ScreenContext)
	if (!context) throw Error('useScreenContext can only be used inside an ScreenContextProvider')
	return context
}
