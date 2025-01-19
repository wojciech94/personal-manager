type Props = {
	currentPage: number
	totalPages: number
	itemsPerPage: number
	nextPage: () => void
	prevPage: () => void
	goToPage: (num: number) => void
	onSetItemsPerPage: (val: number) => void
}

export function Pagination({
	currentPage,
	totalPages,
	itemsPerPage,
	nextPage,
	prevPage,
	goToPage,
	onSetItemsPerPage,
}: Props) {
	const prev2Button = currentPage > 2
	const prevCondition = currentPage > 1
	const nextCondition = currentPage < totalPages
	const next2Button = currentPage < totalPages - 1

	return (
		<>
			<div className='d-flex gap-2 justify-between align-center border-top mx-n4 border-light px-4 pt-4 bg-lighter pb-4 mb-n4 rounded-bottom-3'>
				<div>{`Page ${currentPage} of ${totalPages}`}</div>
				<div className='d-flex gap-2 align-center'>
					{prevCondition && (
						<>
							<button className='btn btn-icon btn-light' onClick={() => goToPage(1)}>
								{'<<'}
							</button>
							<button className='btn btn-icon btn-light' onClick={prevPage}>
								{'<'}
							</button>
							{prev2Button && (
								<button className='btn btn-icon btn-light' onClick={() => goToPage(currentPage - 2)}>
									{currentPage - 2}
								</button>
							)}
							<button className='btn btn-icon btn-light' onClick={() => goToPage(currentPage - 1)}>
								{currentPage - 1}
							</button>
						</>
					)}
					<button className='btn btn-icon btn-primary'>{currentPage}</button>
					{nextCondition && (
						<>
							<button className='btn btn-icon btn-light' onClick={() => goToPage(currentPage + 1)}>
								{currentPage + 1}
							</button>
							{next2Button && (
								<button className='btn btn-icon btn-light' onClick={() => goToPage(currentPage + 2)}>
									{currentPage + 2}
								</button>
							)}
							<button className='btn btn-icon btn-light' onClick={nextPage}>
								{'>'}
							</button>
							<button className='btn btn-icon btn-light' onClick={() => goToPage(totalPages)}>
								{'>>'}
							</button>
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
