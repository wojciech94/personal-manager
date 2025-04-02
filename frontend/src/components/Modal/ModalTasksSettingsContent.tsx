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
		<div className='px-4 flex flex-col gap-2'>
			<div className='-mx-4 min-h-[60px] flex items-center justify-between gap-4 font-semibold bg-zinc-200 py-2 px-4 border-zinc-300 border-y'>
				{t('settings')}
			</div>
			<div className='p-4 flex flex-col gap-2'>
				<FormRow label={t('show_expiration_date')}>
					<input
						className='w-4 h-4 bg-gray-100 border-gray-300'
						type='checkbox'
						checked={showDeadline}
						onChange={e => setShowDeadline(e.target.checked)}
					/>
				</FormRow>
				<FormRow label={t('archivization_time')}>
					<div className='text-normal flex gap-2 items-center'>
						<input
							className='w-75px flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							type='number'
							value={archivizationTime}
							onChange={e => setArchivizationTime(Number(e.target.value))}
						/>{' '}
						{t('hours')}
					</div>
				</FormRow>
				<FormRow label={t('remove_time')}>
					<div className='text-normal flex gap-2 items-center'>
						<input
							className='w-75px flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
							type='number'
							value={removeTime}
							onChange={e => setRemoveTime(Number(e.target.value))}
						/>{' '}
						{t('hours')}
					</div>
				</FormRow>
			</div>
			<div className='-mx-4 min-h-[60px] flex items-center justify-between gap-4 font-semibold bg-zinc-200 py-2 px-4 border-zinc-300 border-y'>
				{t('sorting')}
			</div>
			<div className='pt-4 flex flex-col gap-2'>
				<FormRow label={t('sorting_method')}>
					<select
						name='sortMethod'
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						value={sortMethod}
						id='sortMethod'
						onChange={e => setSortMethod(e.target.value as SortMethods)}>
						<option className='text-gray-800 bg-white hover:bg-gray-100' value='created_at'>
							{t('creation_date')}
						</option>
						<option className='text-gray-800 bg-white hover:bg-gray-100' value='expired_at'>
							{t('expiration_date')}
						</option>
						<option className='text-gray-800 bg-white hover:bg-gray-100' value='priority'>
							{t('priority')}
						</option>
					</select>
				</FormRow>
				<FormRow label={t('sorting_order')}>
					<select
						className='flex-1 max-w-full min-w-0 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
						name='sortDirection'
						value={sortDirection}
						id='sortDirection'
						onChange={e => setSortDirection(e.target.value as 'asc' | 'desc')}>
						<option className='text-gray-800 bg-white hover:bg-gray-100' value='asc'>
							{t('ascending')}
						</option>
						<option className='text-gray-800 bg-white hover:bg-gray-100' value='desc'>
							{t('descending')}
						</option>
					</select>
				</FormRow>
			</div>
			{modalData.actionName && (
				<div className='-mx-4 mt-4 py-4 px-6 border-t border-slate-300 bg-zinc-200 rounded-b-2xl'>
					<Button variant='success' className='w-full' onClick={handleSetTasksSettings}>
						{modalData.actionName}
					</Button>
				</div>
			)}
		</div>
	)
}
