import { useContext } from 'react'
import { useState } from 'react'
import { ModalContext } from '../../contexts/ModalContext'

export const ModalAddUserContent = ({ modalData }) => {
	const [userInput, setUserInput] = useState('')
	const [, setActiveModal] = useContext(ModalContext)

	const handleAddUser = () => {
		if (modalData.action) {
			setActiveModal(null)
			modalData.action(userInput)
		}
	}

	return (
		<div className='d-flex flex-column gap-2 p-4'>
			<input type='text' value={userInput} onChange={e => setUserInput(e.target.value)} />
			<button className='btn btn-success d-flex gap-2 justify-center' onClick={handleAddUser}>
				<span>Add user to dashboard</span>
			</button>
		</div>
	)
}
