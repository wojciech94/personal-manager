import { createContext, useContext } from 'react'

export enum ScreenSize {
	XSMALL = 'extra-small', //576
	SMALL = 'small', //768
	MEDIUM = 'medium', //992
	LARGE = 'large', //1200
	XLARGE = 'extra-large', //1400
}

export type ScreenType = {
	type: ScreenSize
}

export const ScreenContext = createContext<ScreenType | null>(null)

export function useScreenContext() {
	const context = useContext(ScreenContext)
	if (!context) throw Error('useScreenContext can only be used inside an ScreenContextProvider')
	return context
}
