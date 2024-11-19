import { useContext } from 'react'
import { X } from 'react-feather'
import { ModalContext } from '../../contexts/ModalContext'
import { ModalDashboardContent } from './ModalDashboardContent'
import { ModalNoteContent } from './ModalNoteContent'
import { ModalFolderContent } from './ModalFolderContent'
import { ModalAddUserContent } from './ModalAddUserContent'
import { ModalAddCategoryContent } from './ModalAddCategoryContent'

export const Modal = ({ modalName, modalTitle, modalData }) => {
	const [, setActiveModal] = useContext(ModalContext)

	let modalContent = null

	switch (modalName) {
		case 'createDashboard':
			modalContent = <ModalDashboardContent modalData={modalData} />
			break
		case 'addUser':
			modalContent = <ModalAddUserContent modalData={modalData} />
			break
		case 'addNoteCategory':
			modalContent = <ModalAddCategoryContent />
			break
		case 'createNote':
		case 'editNote':
			modalContent = <ModalNoteContent modalData={modalData} />
			break
		case 'editFolder':
			modalContent = <ModalFolderContent modalData={modalData} />
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
				<div className='d-flex gap-4 justify-end'>
					{modalTitle && <div className='flex-1 modal-title p-2 px-4'>{modalTitle}</div>}
					<button onClick={() => setActiveModal(null)}>
						<X size={20} />
					</button>
				</div>
				{modalContent}
			</div>
		</div>
	)
}
