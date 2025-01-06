import { createContext } from 'react'
import { ModalDataProps } from '../components/Modal/types'

interface ModalContextType {
	activeModal: ModalDataProps | null
	setActiveModal: (modal: ModalDataProps | null) => void
}

export const ModalContext = createContext<ModalContextType | null>(null)
