import { useState } from 'react'
import { useTranslation } from '../../contexts/TranslationContext'
import { FormRow } from '../FormRow/FormRow'

export function ModalAddListItem() {
	const [nameValue, setNameValue] = useState('')
	const [weightValue, setWeightValue] = useState('')
	const [quantityValue, setQuantityValue] = useState('')
	const [unitValue, setUnitValue] = useState('kg')
	const { t } = useTranslation()

	return (
		<>
			<div className='d-flex flex-column gap-2 pb-4'>
				<FormRow label={t('product_name')}>
					<input type='text' value={nameValue} onChange={e => setNameValue(e.target.value)} />
				</FormRow>
				<FormRow label={t('weight')}>
					<input type='text' value={weightValue} onChange={e => setWeightValue(e.target.value)} />
				</FormRow>
				<FormRow label={t('unit')}>
					<select name='unitSelect' id='unitSelect' value={unitValue} onChange={e => setUnitValue(e.target.value)}>
						<option value='kg'>{t('kilograms')}</option>
						<option value='dg'>{t('decagrams')}</option>
						<option value='g'>{t('grams')}</option>
					</select>
				</FormRow>
				<FormRow label={t('quantity')}>
					<input type='text' value={quantityValue} onChange={e => setQuantityValue(e.target.value)} />
				</FormRow>
			</div>
		</>
	)
}
