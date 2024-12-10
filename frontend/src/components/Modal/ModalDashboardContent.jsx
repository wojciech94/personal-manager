import { useState } from 'react'
import { FormRow } from '../FormRow/FormRow'

export const ModalDashboardContent = ({ modalData }) => {
	const [dashboardName, setDashboardName] = useState('')

	const handleCreateDashboard = () => {
		if (modalData.action) {
			modalData.action(dashboardName)
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
