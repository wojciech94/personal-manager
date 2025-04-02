import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'react-feather'
import { useTranslation } from '../../contexts/TranslationContext'
import { Button } from '../Button/Button'
import { PaginationProps } from './types'

export function Pagination({
	currentPage,
	totalPages,
	itemsPerPage,
	nextPage,
	prevPage,
	goToPage,
	onSetItemsPerPage,
}: PaginationProps) {
	const { t } = useTranslation()
	const prev2Button = currentPage > 2
	const prevCondition = currentPage > 1
	const nextCondition = currentPage < totalPages
	const next2Button = currentPage < totalPages - 1

	return (
		<>
			<div className='flex gap-2 justify-between items-center border-t border-zinc-300 px-4 pt-4 bg-slate-200 pb-4 rounded-b-2xl'>
				<div>
					{t('page')} <span className='text-nowrap'>{`${currentPage} ${t('of')} ${totalPages}`}</span>
				</div>
				<div className='flex gap-2 items-center'>
					{prevCondition && (
						<>
							<Button variant='white' onlyIcon={true} onClick={() => goToPage(1)}>
								<ChevronsLeft size={16} />
							</Button>
							<Button variant='white' onlyIcon={true} onClick={prevPage}>
								<ChevronLeft size={16} />
							</Button>
							{prev2Button && (
								<Button
									className='hidden sm:block'
									variant='white'
									onlyIcon={true}
									onClick={() => goToPage(currentPage - 2)}>
									{currentPage - 2}
								</Button>
							)}
							<Button variant='white' onlyIcon={true} onClick={() => goToPage(currentPage - 1)}>
								{currentPage - 1}
							</Button>
						</>
					)}
					<Button disabled variant='primary' onlyIcon={true}>
						{currentPage}
					</Button>
					{nextCondition && (
						<>
							<Button variant='white' onlyIcon={true} onClick={() => goToPage(currentPage + 1)}>
								{currentPage + 1}
							</Button>
							{next2Button && (
								<Button
									className='hidden sm:block'
									variant='white'
									onlyIcon={true}
									onClick={() => goToPage(currentPage + 2)}>
									{currentPage + 2}
								</Button>
							)}
							<Button variant='white' onlyIcon={true} onClick={nextPage}>
								<ChevronRight size={16} />
							</Button>
							<Button variant='white' onlyIcon={true} onClick={() => goToPage(totalPages)}>
								<ChevronsRight size={16} />
							</Button>
						</>
					)}
				</div>
				<div className='flex flex-col gap-1 items-end'>
					<div>{t('items_per_page')}</div>
					<select
						className='w-16 px-2 py-1 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
						name='itemsSelect'
						id='itemsSelect'
						value={itemsPerPage}
						onChange={e => onSetItemsPerPage(Number(e.target.value))}>
						<option value='5'>5</option>
						<option value='10'>10</option>
						<option value='20'>20</option>
						<option value='50'>50</option>
					</select>
				</div>
			</div>
		</>
	)
}
