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
import { ModalAddProduct } from './ModalAddProduct'
import { ModalCreateShoppingList } from './ModalCreateShoppingList'
import { ModalModifyShoppingLists } from './ModalModifyShoppingLists'
import { ModalAddShoppingItem } from './ModalAddShoppingItem'
import { ModalDataProps } from './types'
import { Button } from '../Button/Button'
import { ModalAddCalendarEvent } from './ModalAddCalendarEvent'
import React from 'react'
import { ModalUpdateCalendarEvent } from './ModalUpdateCalendarEvent'

export const Modal: React.FC<ModalDataProps> = ({ name, title, data }): React.JSX.Element => {
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
		case 'addCalendarEvent':
			if (data) modalContent = <ModalAddCalendarEvent modalData={data} />
			break
		case 'updateCalendarEvent':
			if (data) modalContent = <ModalUpdateCalendarEvent modalData={data} />
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
		<div className='fixed inset-0 w-full h-screen bg-black bg-opacity-50 backdrop-blur-sm z-[100]'>
			<div className='fixed top-1/2 left-1/2 w-[90%] max-w-[600px] bg-gray-100 border border-gray-500 -translate-x-1/2 -translate-y-1/2 rounded-2xl'>
				<div className='flex gap-4 justify-end items-center p-4'>
					{title && <div className='flex-1 font-semibold text-lg'>{title}</div>}
					<Button variant='text' className='hover:!text-zinc-500' onClick={() => setActiveModal(null)}>
						<X size={20} />
					</Button>
				</div>
				{modalContent}
			</div>
		</div>
	)
}
