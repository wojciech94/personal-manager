import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { ShoppingListsType } from '../../screens/Shopping/types'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'

export function ModalCreateShoppingList({ modalData }: { modalData: DataProps }) {
	const [nameValue, setNameValue] = useState('')
	const { dashboardId } = useParams()
	const { setActiveModal } = useModalContext()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	const createShoppingList = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/shopping-lists`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: nameValue }),
		}

		const response = await fetchData<ShoppingListsType>(url, options)

		if (response.error) {
			console.error('Failed to create shopping list:', response.status, response.error)
		}

		if (response.data) {
			if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 0) {
				const action = modalData.action as () => Promise<void>
				action()
			}
		}
		setActiveModal(null)
	}

	return (
		<>
			<div className='p-4 flex flex-col gap-2 border-t border-zinc-300'>
				<FormRow label={t('name')}>
					<input
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						value={nameValue}
						onChange={e => setNameValue(e.target.value)}
					/>
				</FormRow>
			</div>
			<div className='py-4 px-6 border-t border-slate-300 bg-zinc-200 rounded-b-2xl'>
				<Button variant='success' className='w-full' onClick={createShoppingList}>
					{t('createShoppingList_title')}
				</Button>
			</div>
		</>
	)
}
