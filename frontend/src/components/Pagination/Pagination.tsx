import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'react-feather'
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
	const prev2Button = currentPage > 2
	const prevCondition = currentPage > 1
	const nextCondition = currentPage < totalPages
	const next2Button = currentPage < totalPages - 1

	return (
		<>
			<div className='d-flex gap-2 justify-between align-center border-top border-light px-4 pt-4 bg-lighter pb-4 rounded-bottom-3'>
				<div>
					Page <span className='text-nowrap'>{`${currentPage} of ${totalPages}`}</span>
				</div>
				<div className='d-flex gap-2 align-center'>
					{prevCondition && (
						<>
							<Button variant='light' onlyIcon={true} onClick={() => goToPage(1)}>
								<ChevronsLeft size={16} />
							</Button>
							<Button variant='light' onlyIcon={true} onClick={prevPage}>
								<ChevronLeft size={16} />
							</Button>
							{prev2Button && (
								<Button
									className='d-none d-block-sm'
									variant='light'
									onlyIcon={true}
									onClick={() => goToPage(currentPage - 2)}>
									{currentPage - 2}
								</Button>
							)}
							<Button variant='light' onlyIcon={true} onClick={() => goToPage(currentPage - 1)}>
								{currentPage - 1}
							</Button>
						</>
					)}
					<Button disabled variant='primary' onlyIcon={true}>
						{currentPage}
					</Button>
					{nextCondition && (
						<>
							<Button variant='light' onlyIcon={true} onClick={() => goToPage(currentPage + 1)}>
								{currentPage + 1}
							</Button>
							{next2Button && (
								<Button
									className='d-none d-block-sm'
									variant='light'
									onlyIcon={true}
									onClick={() => goToPage(currentPage + 2)}>
									{currentPage + 2}
								</Button>
							)}
							<Button variant='light' onlyIcon={true} onClick={nextPage}>
								<ChevronRight size={16} />
							</Button>
							<Button variant='light' onlyIcon={true} onClick={() => goToPage(totalPages)}>
								<ChevronsRight size={16} />
							</Button>
						</>
					)}
				</div>
				<div className='d-flex flex-column gap-1 text-end'>
					<div>Items per page</div>
					<select
						className='w-50px'
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
