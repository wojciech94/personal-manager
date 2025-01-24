import { useEffect, useState } from 'react'
import { useModalContext } from '../../contexts/ModalContext'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
import { SortMethods, TasksSettings } from '../Task/Task'
import { DataProps } from './types'

export function ModalTasksSettingsContent({ modalData }: { modalData: DataProps }) {
	const [showDeadline, setShowDeadline] = useState(false)
	const [sortMethod, setSortMethod] = useState(SortMethods.CREATED_AT)
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
	const [archivizationTime, setArchivizationTime] = useState(0)
	const [removeTime, setRemoveTime] = useState(0)
	const { setActiveModal } = useModalContext()

	useEffect(() => {
		if (modalData && modalData.initValue && typeof modalData.initValue !== 'string') {
			setShowDeadline(modalData.initValue.showDeadline)
			setSortMethod(modalData.initValue.sortMethod)
			setSortDirection(modalData.initValue.sortDirection)
			setArchivizationTime(modalData.initValue.archivizationTime)
			setRemoveTime(modalData.initValue.removeTime)
		}
	}, [modalData])

	const handleSetTasksSettings = () => {
		if (modalData.action) {
			const action = modalData.action as (args: TasksSettings) => Promise<void>
			action({ showDeadline, sortMethod, sortDirection, archivizationTime, removeTime })
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
							onChange={e => setArchivizationTime(Number(e.target.value))}
						/>{' '}
						hours
					</div>
				</FormRow>
				<FormRow label='Remove time'>
					<div className='text-normal'>
						<input
							className='w-75px'
							type='number'
							value={removeTime}
							onChange={e => setRemoveTime(Number(e.target.value))}
						/>{' '}
						hours
					</div>
				</FormRow>
			</div>
			<div className='card-subtitle'>Sorting</div>
			<div className='pt-4 d-flex flex-column gap-2'>
				<FormRow label='Sorting method'>
					<select
						name='sortMethod'
						value={sortMethod}
						id='sortMethod'
						onChange={e => setSortMethod(e.target.value as SortMethods)}>
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
						onChange={e => setSortDirection(e.target.value as 'asc' | 'desc')}>
						<option value='asc'>Ascending</option>
						<option value='desc'>Descending</option>
					</select>
				</FormRow>
			</div>
			{modalData.actionName && (
				<div className='card-footer mt-4'>
					<Button variant='success' className='w-100' onClick={handleSetTasksSettings}>
						{modalData.actionName}
					</Button>
				</div>
			)}
		</>
	)
}
