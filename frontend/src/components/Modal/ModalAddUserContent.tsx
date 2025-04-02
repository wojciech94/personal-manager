import { useState } from 'react'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'

export const ModalAddUserContent = ({ modalData }: { modalData: DataProps }) => {
	const [userInput, setUserInput] = useState('')
	const { setActiveModal } = useModalContext()
	const { t } = useTranslation()

	const handleInviteUser = () => {
		if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 1) {
			const action = modalData.action as (str: string) => Promise<void>
			action(userInput)
			setActiveModal(null)
		}
	}

	return (
		<>
			<div className='p-4 flex flex-col gap-2 border-t border-zinc-300'>
				<FormRow label={t('name')}>
					<input
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						type='text'
						value={userInput}
						onChange={e => setUserInput(e.target.value)}
					/>
				</FormRow>
			</div>
			<div className='py-4 px-6 border-t border-slate-300 bg-zinc-200 rounded-b-2xl'>
				<Button variant='success' className='w-full' onClick={handleInviteUser}>
					{t('invite_user_to_dashboard')}
				</Button>
			</div>
		</>
	)
}
