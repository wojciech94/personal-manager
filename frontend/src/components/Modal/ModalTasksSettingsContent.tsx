import { useContext } from 'react'
import { useState } from 'react'
import { ModalContext } from '../../contexts/ModalContext'
import { FormRow } from '../FormRow/FormRow'

export function ModalTasksSettingsContent({ modalData }) {
	const [showDeadline, setShowDeadline] = useState(modalData?.initValue?.showDeadline || false)
	const [sortMethod, setSortMethod] = useState(modalData?.initValue?.sortMethod || 'creation')
	const [sortDirection, setSortDirection] = useState(modalData?.initValue?.sortDirection || 'asc')
	const [archivizationTime, setArchivizationTime] = useState(modalData?.initValue?.archivizationTime)
	const [removeTime, setRemoveTime] = useState(modalData?.initValue?.removeTime)

	const [, setActiveModal] = useContext(ModalContext)

	const handleSetTasksSettings = () => {
		if (modalData.action) {
			modalData.action({ showDeadline, sortMethod, sortDirection, archivizationTime, removeTime })
			setActiveModal(null)
		}
	}

	return (
		<>
			<div className='card-subtitle'>Settings</div>
			<div className='p-4 d-flex flex-column gap-2'>
				<FormRow label='Show expiration date'>
					<input type='checkbox' checked={showDeadline} onChange={e => setShowDeadline(e.target.checked)} />
				</FormRow>
				<FormRow label='Archivization time'>
					<div className='text-normal'>
						<input
							className='w-75px'
							type='number'
							value={archivizationTime}
							onChange={e => setArchivizationTime(e.target.value)}
						/>{' '}
						hours
					</div>
				</FormRow>
				<FormRow label='Remove time'>
					<div className='text-normal'>
						<input className='w-75px' type='number' value={removeTime} onChange={e => setRemoveTime(e.target.value)} />{' '}
						hours
					</div>
				</FormRow>
			</div>
			<div className='card-subtitle'>Sorting</div>
			<div className='pt-4 d-flex flex-column gap-2'>
				<FormRow label='Sorting method'>
					<select name='sortMethod' value={sortMethod} id='sortMethod' onChange={e => setSortMethod(e.target.value)}>
						<option value='created_at'>Creation date</option>
						<option value='expired_at'>Expiration date</option>
						<option value='priority'>Priority</option>
					</select>
				</FormRow>
				<FormRow label='Sorting order'>
					<select
						name='sortDirection'
						value={sortDirection}
						id='sortDirection'
						onChange={e => setSortDirection(e.target.value)}>
						<option value='asc'>Ascending</option>
						<option value='desc'>Descending</option>
					</select>
				</FormRow>
			</div>
			{modalData.actionName && (
				<div className='card-footer mt-4'>
					<button className='btn btn-success d-block w-100' onClick={handleSetTasksSettings}>
						{modalData.actionName}
					</button>
				</div>
			)}
		</>
	)
}
