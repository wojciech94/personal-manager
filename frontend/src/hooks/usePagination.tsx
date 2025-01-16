import { useEffect, useMemo, useState } from 'react'
import { Product } from '../components/Products/Products'

export function usePagination(items: Product[], itemsPerPage: number) {
	const [currentPage, setCurrentPage] = useState(1)

	useEffect(() => {
		if (currentPage > Math.ceil(items.length / itemsPerPage)) {
			setCurrentPage(1)
		}
	}, [items, itemsPerPage])

	const totalPages = useMemo(() => {
		return Math.ceil(items.length / itemsPerPage)
	}, [items, itemsPerPage])

	const currentItems = useMemo(() => {
		const start = (currentPage - 1) * itemsPerPage
		const end = start + itemsPerPage
		return items.slice(start, end)
	}, [currentPage, items, itemsPerPage])

	const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages))
	const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1))
	const goToPage = (page: number) => setCurrentPage(() => Math.max(1, Math.min(page, totalPages)))

	return {
		currentItems,
		currentPage,
		totalPages,
		itemsPerPage,
		nextPage,
		prevPage,
		goToPage,
	}
}
