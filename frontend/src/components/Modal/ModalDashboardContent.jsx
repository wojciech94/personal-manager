import { useState } from 'react'

export const ModalDashboardContent = ({modalData}) => {
	const [dashboardName, setDashboardName] = useState('')

	const handleCreateDashboard = () => {
		if (modalData.action) {
			modalData.action(dashboardName)
		}
	}

	return (
		<div className={`d-flex flex-column p-3 gap-2`}>
			<div className='d-flex gap-2 mb-4'>
				<label htmlFor='dshb'>Dashboard name</label>
				<input
					type='text'
					name='dshb'
					id='dshb'
					value={dashboardName}
					onChange={e => setDashboardName(e.target.value)}
				/>
			</div>
			<button className='btn btn-primary' onClick={handleCreateDashboard}>{modalData.actionName}</button>
		</div>
	)
}
