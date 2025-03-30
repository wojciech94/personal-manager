import { useState } from 'react'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'

export const ModalAddCategoryContent = () => {
	const [nameValue, setNameValue] = useState('')
	const { setActiveModal } = useModalContext()
	const { fetchData } = useApi()
	const { t } = useTranslation()

	//ToDo: Można aktualizować kategorie po dodaniu
	const addCategory = async () => {
		const url = `${API_URL}notes/add-category`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: nameValue }),
		}

		const response = await fetchData<void>(url, options)

		if (response.error) {
			console.error('Failed to add category:', response.status, response.error)
		}

		setActiveModal(null)
	}

	//ToDo: Update i delete dla kategorii

	return (
		<>
			<div className='p-4 flex flex-col gap-2 border-t border-zinc-300'>
				<FormRow label={t('category_name')}>
					<input
						type='text'
						className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						value={nameValue}
						onChange={e => setNameValue(e.target.value)}
					/>
				</FormRow>
			</div>
			<div className='py-4 px-6 border-t border-slate-300 bg-zinc-200 rounded-b-2xl'>
				<Button variant='success' className='w-full' onClick={addCategory}>
					{t('add_category')}
				</Button>
			</div>
		</>
	)
}
