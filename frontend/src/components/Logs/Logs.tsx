import { useState } from 'react'
import { useTranslation } from '../../contexts/TranslationContext'
import { usePagination } from '../../hooks/usePagination'
import { getLocaleDateTime } from '../../utils/helpers'
import { Pagination } from '../Pagination/Pagination'
import { Log } from './types'

export const Logs = ({ logs }: { logs: Log[] }) => {
	const [logsCount, setLogsCount] = useState(10)
	const { currentItems, currentPage, totalPages, itemsPerPage, nextPage, prevPage, goToPage } = usePagination(
		logs,
		logsCount
	)
	const { t } = useTranslation()

	const handleSetItems = (value: number) => {
		setLogsCount(value)
	}

	return (
		<div className='d-flex flex-column gap-2'>
			<div className='card-subtitle'>{t('activities')}</div>
			<table cellSpacing={0} className='w-100 mb-n2'>
				<thead>
					<tr className='border-bottom'>
						<th className='ps-4'>{t('details')}</th>
						<th className='text-center'>{t('time')}</th>
						<th className='text-end'>{t('author')}</th>
					</tr>
				</thead>
				<tbody className='zebra'>
					{currentItems.map(log => (
						<tr key={log._id} className='border-bottom'>
							<td className='flex-1'>{log.message}</td>
							<td className='text-center'>{getLocaleDateTime(log.timestamps)}</td>
							<td className='text-bold text-end'>{log.initiatorId.name}</td>
						</tr>
					))}
				</tbody>
			</table>
			<Pagination
				currentPage={currentPage}
				itemsPerPage={itemsPerPage}
				onSetItemsPerPage={handleSetItems}
				totalPages={totalPages}
				prevPage={prevPage}
				nextPage={nextPage}
				goToPage={goToPage}
			/>
		</div>
	)
}
