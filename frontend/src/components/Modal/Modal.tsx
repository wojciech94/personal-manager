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
import { Button } from '../Button/Button'

export const Modal: React.FC<ModalDataProps> = ({ name, title, data }): JSX.Element => {
	const { setActiveModal } = useModalContext()

	let modalContent = null

	switch (name) {
		case 'createDashboard':
			if (data) modalContent = <ModalDashboardContent modalData={data} />
			break
		case 'addUser':
			if (data) modalContent = <ModalAddUserContent modalData={data} />
			break
		case 'addNoteCategory':
			modalContent = <ModalAddCategoryContent />
			break
		case 'createNote':
		case 'editNote':
			if (data) modalContent = <ModalNoteContent modalData={data} />
			break
		case 'editFolder':
			if (data) modalContent = <ModalFolderContent modalData={data} />
			break
		case 'modifyTodoGroup':
			if (data) modalContent = <ModalModifyTodoGroup modalData={data} />
			break
		case 'addTask':
			if (data) modalContent = <ModalAddTask modalData={data} />
			break
		case 'tasksSettings':
			if (data) modalContent = <ModalTasksSettingsContent modalData={data} />
			break
		case 'addListItem':
			modalContent = <ModalAddListItem />
			break
		case 'createShoppingList':
			if (data) modalContent = <ModalCreateShoppingList modalData={data} />
			break
		case 'modifyShoppingLists':
			if (data) modalContent = <ModalModifyShoppingLists modalData={data} />
			break
		case 'addShoppingItem':
			modalContent = <ModalAddShoppingItem />
			break
		case 'addProduct':
			if (data) modalContent = <ModalAddProduct modalData={data} />
			break
		default:
			modalContent = <>{`Not implemented modal type: ${name}`}</>
	}

	if (!name) {
		return <></>
	}

	return (
		<div className='modal-backdrop'>
			<div className='modal'>
				<div className='d-flex gap-4 justify-end align-center p-4'>
					{title && <div className='flex-1 modal-title'>{title}</div>}
					<Button variant='text' onClick={() => setActiveModal(null)}>
						<X size={20} />
					</Button>
				</div>
				{modalContent}
			</div>
		</div>
	)
}
