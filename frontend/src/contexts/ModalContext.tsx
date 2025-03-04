import { createContext, useContext } from 'react'
import { ModalContextType } from '../components/Modal/types'

export const ModalContext = createContext<ModalContextType | null>(null)

export function useModalContext() {
	const context = useContext(ModalContext)
	if (!context) throw Error('useModalContext can only be used inside an ModalContextProvider')
	return context
}
