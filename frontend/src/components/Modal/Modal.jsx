import { useContext } from 'react'
import { ModalContext } from '../../contexts/ModalContext'
import { ModalDashboardContent } from './ModalDashboardContent'
import { ModalNoteContent } from './ModalNoteContent'
import { X } from 'react-feather'

export const Modal = ({ modalName, modalData }) => {
	const [, setActiveModal] = useContext(ModalContext)

	let modalContent = null

	switch (modalName) {
		case 'createDashboard':
			modalContent = <ModalDashboardContent modalData={modalData} />
			break
		case 'createNote':
		case 'editNote':
			modalContent = <ModalNoteContent modalData={modalData} />
			break
		default:
			modalContent = <>Alert</>
	}

	if (!modalName) {
		return <></>
	}

	return (
		<div className='modal-backdrop'>
			<div className='modal'>
				<div className='d-flex justify-end'>
					<button onClick={() => setActiveModal(null)}><X size={20}/></button>
				</div>
				{modalContent}
			</div>
		</div>
	)
}
