import { useEffect, useState } from 'react'
import { Plus } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useModalContext } from '../../contexts/ModalContext'
import { ProductsList } from './ProductsList'
import { CATEGORIES } from '../../constants/appConstants'
import { usePagination } from '../../hooks/usePagination'
import { Pagination } from '../../components/Pagination/Pagination'
import { Alert } from '../../components/Alert/Alert'
import { Button } from '../../components/Button/Button'
import { useAuth } from '../../contexts/AuthContext'

export type Product = {
	_id: string
	name: string
	category: string
	unit: string
	price: number
	tags: string
	isFavourite?: boolean
}

export function Products() {
	const { setActiveModal } = useModalContext()
	const [products, setProducts] = useState<Product[]>([])
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
	const [selectedCategory, setSelectedCategory] = useState('')
	const { dashboardId } = useParams()
	const [itemsPerPage, setItemsPerPage] = useState(10)
	const [sortBy, setSortBy] = useState<'name' | 'category'>('name')
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
	const { accessToken } = useAuth()

	const { currentItems, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(
		filteredProducts,
		itemsPerPage
	)

	const fetchProducts = async () => {
		if (!accessToken) {
			console.error('No token found in localStorage')
		}
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/products?sort_by=${sortBy}&direction=${sortDir}`, {
			headers: {
				Authorization: `Bearer ${accessToken}`,
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
	}, [sortBy, sortDir])

	const modalData = {
		title: 'Add product',
		data: { action: fetchProducts },
		name: 'addProduct',
	}

	const handleSelectCategory = (value: string) => {
		setSelectedCategory(value)
		if (value) {
			const newProducts = products.filter(p => p.category === value)
			setFilteredProducts(newProducts)
		} else {
			setFilteredProducts(products)
		}
	}

	const handleSetItemsPerPage = (itemsCount: number) => {
		setItemsPerPage(itemsCount)
	}

	return (
		<>
			<div className='d-flex flex-wrap justify-between align-center gap-3'>
				<div className='d-flex gap-4 align-center'>
					<div className='card-title'>Products</div>
				</div>
				<div className='d-flex gap-2 align-center'>
					<Button className='text-nowrap' onClick={() => setActiveModal(modalData)}>
						<Plus size={16} />
						Add product
					</Button>
				</div>
				<div
					className='d-flex flex-wrap justify-between justify-start-sm gap-4 pt-2 border-top border-light mx-n4 px-4'
					style={{ width: 'calc(100% + 32px)' }}>
					<div className='d-flex flex-column gap-1'>
						<div className='text-gray'>Filter:</div>
						<select
							name='catSelect'
							id='catSelect'
							value={selectedCategory}
							onChange={e => handleSelectCategory(e.target.value)}>
							<option value=''>All categories</option>
							{CATEGORIES &&
								CATEGORIES.length > 0 &&
								CATEGORIES.map(c => (
									<option key={c.value} value={c.value}>
										{c.name}
									</option>
								))}
						</select>
					</div>
					<div className='d-flex flex-column gap-1'>
						<div className='text-gray'>Sort by:</div>
						<select
							name='sortby'
							id='sortby'
							value={sortBy}
							onChange={e => setSortBy(e.target.value as 'name' | 'category')}>
							<option value='name'>Name</option>
							<option value='category'>Category</option>
						</select>
					</div>
					<div className='d-flex flex-column gap-1'>
						<div className='text-gray'>Sort direction:</div>
						<select
							name='sortdir'
							id='sortdir'
							value={sortDir}
							onChange={e => setSortDir(e.target.value as 'asc' | 'desc')}>
							<option value='asc'>Ascending</option>
							<option value='desc'>Descending</option>
						</select>
					</div>
				</div>
			</div>
			{products && currentItems && currentItems.length > 0 ? (
				<div className='mx-n4 mb-n4'>
					<ProductsList products={currentItems} />
					<Pagination
						currentPage={currentPage}
						totalPages={totalPages}
						itemsPerPage={itemsPerPage}
						nextPage={nextPage}
						prevPage={prevPage}
						goToPage={goToPage}
						onSetItemsPerPage={handleSetItemsPerPage}
					/>
				</div>
			) : (
				<div className='mx-n4 mt-4 mb-n4 border-top border-light'>
					<Alert variant='primary'>
						<div>
							Add products to your database or <Button variant='link'>import</Button> default data.
						</div>
					</Alert>
				</div>
			)}
		</>
	)
}
