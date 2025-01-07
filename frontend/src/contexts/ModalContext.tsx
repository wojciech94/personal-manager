import { createContext, useContext } from 'react'
import { ModalDataProps } from '../components/Modal/types'

type ModalContextType = {
	activeModal: ModalDataProps | null
	setActiveModal: (modal: ModalDataProps | null) => void
}

export const ModalContext = createContext<ModalContextType | null>(null)

export function useModalContext() {
	const context = useContext(ModalContext)
	if (!context) throw Error('useModalContext can only be used inside an ModalContextProvider')
	return context
}
