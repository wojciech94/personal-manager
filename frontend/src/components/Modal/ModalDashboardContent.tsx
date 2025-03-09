import { useState } from 'react'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'

export const ModalDashboardContent = ({ modalData }: { modalData: DataProps }) => {
	const [dashboardName, setDashboardName] = useState('')
	const {t} = useTranslation()

	const handleCreateDashboard = () => {
		if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 1) {
			const action = modalData.action as (args: string) => Promise<void>
			action(dashboardName)
		}
	}

	return (
		<>
			<div className='card-content'>
				<FormRow label={t('dashboard_name')}>
					<input
						type='text'
						name='dshb'
						id='dshb'
						value={dashboardName}
						onChange={e => setDashboardName(e.target.value)}
					/>
				</FormRow>
			</div>
			<div className='card-footer'>
				<Button variant='success' className='w-100' onClick={handleCreateDashboard}>
					{modalData.actionName}
				</Button>
			</div>
		</>
	)
}
