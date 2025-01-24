import { useState } from 'react'
import { useModalContext } from '../../contexts/ModalContext'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'

export const ModalAddUserContent = ({ modalData }: { modalData: DataProps }) => {
	const [userInput, setUserInput] = useState('')
	const { setActiveModal } = useModalContext()

	const handleAddUser = () => {
		if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 1) {
			const action = modalData.action as (str: string) => Promise<void>
			action(userInput)
			setActiveModal(null)
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
				<Button variant='success' className='w-100' onClick={handleAddUser}>
					Add user to dashboard
				</Button>
			</div>
		</>
	)
}
