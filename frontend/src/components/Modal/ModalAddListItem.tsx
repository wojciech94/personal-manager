import { useState } from 'react'
import { FormRow } from '../FormRow/FormRow'

export function ModalAddListItem() {
	const [nameValue, setNameValue] = useState('')
	const [weightValue, setWeightValue] = useState('')
	const [quantityValue, setQuantityValue] = useState('')
	const [unitValue, setUnitValue] = useState('kg')

	return (
		<>
			<div className='d-flex flex-column gap-2 pb-4'>
				<FormRow label='Product name'>
					<input type='text' value={nameValue} onChange={e => setNameValue(e.target.value)} />
				</FormRow>
				<FormRow label='Weight'>
					<input type='text' value={weightValue} onChange={e => setWeightValue(e.target.value)} />
				</FormRow>
				<FormRow label='Unit'>
					<select name='unitSelect' id='unitSelect' value={unitValue} onChange={e => setUnitValue(e.target.value)}>
						<option value='kg'>Kilograms</option>
						<option value='dg'>Dekagrams</option>
						<option value='g'>Grams</option>
					</select>
				</FormRow>
				<FormRow label='Quantity'>
					<input type='text' value={quantityValue} onChange={e => setQuantityValue(e.target.value)} />
				</FormRow>
			</div>
		</>
	)
}
