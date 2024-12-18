import { useContext } from 'react'
import { X } from 'react-feather'
import { ModalContext } from '../../contexts/ModalContext'
import { ModalDashboardContent } from './ModalDashboardContent'
import { ModalNoteContent } from './ModalNoteContent'
import { ModalFolderContent } from './ModalFolderContent'
import { ModalAddUserContent } from './ModalAddUserContent'
import { ModalAddCategoryContent } from './ModalAddCategoryContent'
import { ModalModifyTodoGroup } from './ModalModifyTodoGroup'
import { ModalAddTask } from './ModalAddTask'
import { ModalTasksSettingsContent } from './ModalTasksSettingsContent'
import { ModalAddListItem } from './ModalAddListItem'
import { ModalAddProduct } from './ModalAddProduct'
import { ModalCreateShoppingList } from './ModalCreateShoppingList'

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
		case 'modifyTodoGroup':
			modalContent = <ModalModifyTodoGroup modalData={modalData} />
			break
		case 'addTask':
			modalContent = <ModalAddTask modalData={modalData} />
			break
		case 'tasksSettings':
			modalContent = <ModalTasksSettingsContent modalData={modalData} />
			break
		case 'addListItem':
			modalContent = <ModalAddListItem modalData={modalData} />
			break
		case 'createShoppingList':
			modalContent = <ModalCreateShoppingList modalData={modalData} />
			break
		case 'addProduct':
			modalContent = <ModalAddProduct modalData={modalData} />
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
				<div className='d-flex gap-4 justify-end p-4'>
					{modalTitle && <div className='flex-1 modal-title p-2'>{modalTitle}</div>}
					<button onClick={() => setActiveModal(null)}>
						<X size={20} />
					</button>
				</div>
				{modalContent}
			</div>
		</div>
	)
}
