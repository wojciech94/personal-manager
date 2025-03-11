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
			<div className='card-content'>
				<FormRow label={t('category_name')}>
					<input type='text' value={nameValue} onChange={e => setNameValue(e.target.value)} />
				</FormRow>
			</div>
			<div className='card-footer'>
				<Button size='sm' variant='success' className='w-100' onClick={addCategory}>
					{t('add_category')}
				</Button>
			</div>
		</>
	)
}
