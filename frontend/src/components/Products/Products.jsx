import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { Plus } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { ModalContext } from '../../contexts/ModalContext'
import { ProductsList } from '../ProductsList/ProductsList'
import { CATEGORIES } from '../../constants/appConstants'
import { usePagination } from '../../hooks/usePagination'
import { Pagination } from '../Pagination/Pagination'

export function Products() {
	const [, setActiveModal] = useContext(ModalContext)
	const [products, setProducts] = useState([])
	const [filteredProducts, setFilteredProducts] = useState([])
	const [selectedCategory, setSelectedCategory] = useState('')
	const { dashboardId } = useParams()
	const [itemsPerPage, setItemsPerPage] = useState(5)

	const { currentItems, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(
		filteredProducts,
		itemsPerPage
	)

	const fetchProducts = async () => {
		const token = localStorage.getItem('token')
		if (!token) {
			console.error('No token found in localStorage')
		}
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/products`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		if (res.ok) {
			const data = await res.json()
			if (data) {
				setProducts(data)
				setFilteredProducts(data)
			}
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	useEffect(() => {
		fetchProducts()
	}, [])

	const modalData = {
		title: 'Add product',
		data: { action: fetchProducts },
		name: 'addProduct',
	}

	const handleSelectCategory = value => {
		setSelectedCategory(value)
		if (value) {
			const newProducts = products.filter(p => p.category === value)
			setFilteredProducts(newProducts)
		} else {
			setFilteredProducts(products)
		}
	}

	const handleSetItemsPerPage = items => {
		setItemsPerPage(items)
	}

	return (
		<>
			<div className='d-flex justify-between align-center gap-3'>
				<div className='d-flex gap-5 align-center'>
					<div className='card-title'>Products</div>
					<div className='d-flex flex-column gap-1'>
						<div className='text-gray'>Filter:</div>
						<select
							name='catSelect'
							id='catSelect'
							value={selectedCategory}
							onChange={e => handleSelectCategory(e.target.value)}>
							<option value=''>All categories</option>
							{CATEGORIES && CATEGORIES.length > 0 && CATEGORIES.map(c => <option value={c.value}>{c.name}</option>)}
						</select>
					</div>
				</div>
				<div className='d-flex gap-2 align-center'>
					<button className='btn btn-primary d-flex gap-1' onClick={() => setActiveModal(modalData)}>
						<Plus size={16} />
						Add product
					</button>
				</div>
			</div>
			{currentItems && currentItems.length > 0 && (
				<>
					<ProductsList products={currentItems} />
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						nextPage={nextPage}
						prevPage={prevPage}
						goToPage={goToPage}
						onSetItemsPerPage={handleSetItemsPerPage}
					/>
				</>
			)}
		</>
	)
}
