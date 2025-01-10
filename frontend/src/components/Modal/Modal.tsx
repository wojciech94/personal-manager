import { X } from 'react-feather'
import { useModalContext } from '../../contexts/ModalContext'
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
import { ModalModifyShoppingLists } from './ModalModifyShoppingLists'
import { ModalAddShoppingItem } from './ModalAddShoppingItem'
import { ModalDataProps } from './types'

export const Modal: React.FC<ModalDataProps> = ({ name, title, data }): JSX.Element => {
	const { setActiveModal } = useModalContext()

	let modalContent = null

	switch (name) {
		case 'createDashboard':
			modalContent = <ModalDashboardContent modalData={data} />
			break
		case 'addUser':
			modalContent = <ModalAddUserContent modalData={data} />
			break
		case 'addNoteCategory':
			modalContent = <ModalAddCategoryContent />
			break
		case 'createNote':
		case 'editNote':
			modalContent = <ModalNoteContent modalData={data} />
			break
		case 'editFolder':
			modalContent = <ModalFolderContent modalData={data} />
			break
		case 'modifyTodoGroup':
			modalContent = <ModalModifyTodoGroup modalData={data} />
			break
		case 'addTask':
			modalContent = <ModalAddTask modalData={data} />
			break
		case 'tasksSettings':
			modalContent = <ModalTasksSettingsContent modalData={data} />
			break
		case 'addListItem':
			modalContent = <ModalAddListItem modalData={data} />
			break
		case 'createShoppingList':
			modalContent = <ModalCreateShoppingList modalData={data} />
			break
		case 'modifyShoppingLists':
			modalContent = <ModalModifyShoppingLists modalData={data} />
			break
		case 'addShoppingItem':
			modalContent = <ModalAddShoppingItem />
			break
		case 'addProduct':
			modalContent = <ModalAddProduct modalData={data} />
			break
		default:
			modalContent = <>Alert</>
	}

	if (!name) {
		return <></>
	}

	return (
		<div className='modal-backdrop'>
			<div className='modal'>
				<div className='d-flex gap-4 justify-end p-4'>
					{title && <div className='flex-1 modal-title p-2'>{title}</div>}
					<button onClick={() => setActiveModal?.(null)}>
						<X size={20} />
					</button>
				</div>
				{modalContent}
			</div>
		</div>
	)
}
