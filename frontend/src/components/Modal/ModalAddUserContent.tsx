import { useContext } from 'react'
import { useState } from 'react'
import { ModalContext } from '../../contexts/ModalContext'
import { FormRow } from '../FormRow/FormRow'

export const ModalAddUserContent = ({ modalData }) => {
	const [userInput, setUserInput] = useState('')
	const { setActiveModal } = useModalContext()

	const handleAddUser = () => {
		if (modalData.action) {
			setActiveModal(null)
			modalData.action(userInput)
		}
	}

	return (
		<>
			<div className='card-content'>
				<FormRow label='Name'>
					<input type='text' value={userInput} onChange={e => setUserInput(e.target.value)} />
				</FormRow>
			</div>
			<div className='card-footer'>
				<button className='btn btn-success d-block w-100' onClick={handleAddUser}>
					Add user to dashboard
				</button>
			</div>
		</>
	)
}
