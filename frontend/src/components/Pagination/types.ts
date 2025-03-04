export type PaginationProps = {
	currentPage: number
	totalPages: number
	itemsPerPage: number
	nextPage: () => void
	prevPage: () => void
	goToPage: (num: number) => void
	onSetItemsPerPage: (val: number) => void
}