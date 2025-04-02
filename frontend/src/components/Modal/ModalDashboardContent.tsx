import { useState } from 'react'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'

export const ModalDashboardContent = ({ modalData }: { modalData: DataProps }) => {
	const [dashboardName, setDashboardName] = useState('')
	const { t } = useTranslation()

	const handleCreateDashboard = () => {
		if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 1) {
			const action = modalData.action as (args: string) => Promise<void>
			action(dashboardName)
		}
	}

	return (
		<>
			<div className='p-4 border-t border-zinc-300'>
				<FormRow label={t('dashboard_name')}>
					<input
						type='text'
						name='dshb'
						id='dshb'
						className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						value={dashboardName}
						onChange={e => setDashboardName(e.target.value)}
					/>
				</FormRow>
			</div>
			<div className='py-4 px-6 border-t border-slate-200 bg-zinc-100  rounded-b-2xl'>
				<Button variant='success' className='w-full' onClick={handleCreateDashboard}>
					{modalData.actionName}
				</Button>
			</div>
		</>
	)
}
