import { useState } from 'react'
import { FormRow } from '../FormRow/FormRow'
import { DataProps } from './types'

export const ModalDashboardContent = ({ modalData }: { modalData: DataProps }) => {
	const [dashboardName, setDashboardName] = useState('')

	const handleCreateDashboard = () => {
		if (modalData.action && typeof modalData.action === 'function' && modalData.action.length === 1) {
			const action = modalData.action as (args: string) => Promise<void>
			action(dashboardName)
		}
	}

	return (
		<>
			<div className='card-content'>
				<FormRow label='Dashboard name'>
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
				<button className='btn btn-success d-block w-100' onClick={handleCreateDashboard}>
					{modalData.actionName}
				</button>
			</div>
		</>
	)
}
