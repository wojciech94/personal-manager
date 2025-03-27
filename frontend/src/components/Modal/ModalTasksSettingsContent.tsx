import { useEffect, useState } from 'react'
import { useModalContext } from '../../contexts/ModalContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { FormRow } from '../FormRow/FormRow'
import { SortMethods, TasksSettings } from '../Task/types'
import { DataProps } from './types'

export function ModalTasksSettingsContent({ modalData }: { modalData: DataProps }) {
	const [showDeadline, setShowDeadline] = useState(false)
	const [sortMethod, setSortMethod] = useState(SortMethods.CREATED_AT)
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
	const [archivizationTime, setArchivizationTime] = useState(0)
	const [removeTime, setRemoveTime] = useState(0)
	const { setActiveModal } = useModalContext()
	const { t } = useTranslation()

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
			<div className='card-subtitle'>{t('settings')}</div>
			<div className='p-4 flex flex-col gap-2'>
				<FormRow label={t('show_expiration_date')}>
					<input type='checkbox' checked={showDeadline} onChange={e => setShowDeadline(e.target.checked)} />
				</FormRow>
				<FormRow label={t('archivization_time')}>
					<div className='text-normal'>
						<input
							className='w-75px'
							type='number'
							value={archivizationTime}
							onChange={e => setArchivizationTime(Number(e.target.value))}
						/>{' '}
						{t('hours')}
					</div>
				</FormRow>
				<FormRow label={t('remove_time')}>
					<div className='text-normal'>
						<input
							className='w-75px'
							type='number'
							value={removeTime}
							onChange={e => setRemoveTime(Number(e.target.value))}
						/>{' '}
						{t('hours')}
					</div>
				</FormRow>
			</div>
			<div className='card-subtitle'>{t('sorting')}</div>
			<div className='pt-4 flex flex-col gap-2'>
				<FormRow label={t('sorting_method')}>
					<select
						name='sortMethod'
						value={sortMethod}
						id='sortMethod'
						onChange={e => setSortMethod(e.target.value as SortMethods)}>
						<option value='created_at'>{t('creation_date')}</option>
						<option value='expired_at'>{t('expiration_date')}</option>
						<option value='priority'>{t('priority')}</option>
					</select>
				</FormRow>
				<FormRow label='Sorting order'>
					<select
						name='sortDirection'
						value={sortDirection}
						id='sortDirection'
						onChange={e => setSortDirection(e.target.value as 'asc' | 'desc')}>
						<option value='asc'>{t('ascending')}</option>
						<option value='desc'>{t('descending')}</option>
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
