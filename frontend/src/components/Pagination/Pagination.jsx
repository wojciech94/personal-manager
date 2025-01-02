export function Pagination({ currentPage, totalPages, nextPage, prevPage, goToPage }) {
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
                <div></div>
			</div>
		</>
	)
}
