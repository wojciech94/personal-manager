import { useState } from 'react'
import { useTranslation } from '../../contexts/TranslationContext'
import { usePagination } from '../../hooks/usePagination'
import { getLocaleDateTime } from '../../utils/datetime'
import { Pagination } from '../../components/Pagination/Pagination'
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
		<div className='-mx-4 flex flex-col gap-2 overflow-x-auto'>
			<div className='min-h-[60px] flex items-center justify-between gap-4 font-semibold bg-zinc-200 py-2 px-4 border-zinc-300 border-y'>
				{t('activities')}
			</div>
			<table cellSpacing={0} className='w-full -mb-2'>
				<thead>
					<tr className='border-b'>
						<th className='table-cell text-start'>{t('details')}</th>
						<th className='table-cell text-center'>{t('time')}</th>
						<th className='table-cell text-end'>{t('author')}</th>
					</tr>
				</thead>
				<tbody>
					{currentItems.map(log => (
						<tr key={log._id} className='border-b odd:bg-zinc-100'>
							<td className='flex-1 table-cell'>{log.message}</td>
							<td className='text-center table-cell'>{getLocaleDateTime(log.timestamps)}</td>
							<td className='font-semibold text-end table-cell'>{log.initiatorId.name}</td>
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
