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
import { useApi } from '../../contexts/ApiContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { Product } from './types'

export function Products() {
	const [products, setProducts] = useState<Product[]>([])
	const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
	const [selectedCategory, setSelectedCategory] = useState('')
	const [itemsPerPage, setItemsPerPage] = useState(10)
	const [sortBy, setSortBy] = useState<'name' | 'category'>('name')
	const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
	const { setActiveModal } = useModalContext()
	const { dashboardId } = useParams()
	const { fetchData } = useApi()
	const { t, language } = useTranslation()

	const { currentItems, currentPage, totalPages, nextPage, prevPage, goToPage } = usePagination(
		filteredProducts,
		itemsPerPage
	)

	useEffect(() => {
		fetchProducts()
	}, [sortBy, sortDir])

	const fetchProducts = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/products?sort_by=${sortBy}&direction=${sortDir}`

		const response = await fetchData<Product[]>(url)

		if (response.error) {
			console.error('Failed to fetch products:', response.status, response.error)
			return
		}

		if (response.data) {
			const data: Product[] = response.data
			setProducts(data)
			setFilteredProducts(data)
		}
	}

	const importDefaultData = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/import-products`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				language: language,
			}),
		}

		const response = await fetchData<Product[]>(url, options)

		if (response.error) {
			console.error('Failed to fetch products:', response.status, response.error)
			return
		}

		if (response.data) {
			const data: Product[] = response.data
			setProducts(data)
			setFilteredProducts(data)
		}
	}

	const modalData = {
		title: t('add_product'),
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
			<div className='flex flex-wrap justify-between items-center gap-3'>
				<div className='flex gap-4 items-center'>
					<div className='font-semibold text-lg'>{t('products')}</div>
				</div>
				<div className='flex gap-2 items-center'>
					<Button className='text-nowrap' onClick={() => setActiveModal(modalData)}>
						<Plus size={18} />
						{t('add_product')}
					</Button>
				</div>
				<div
					className='flex flex-wrap justify-between sm:justify-start gap-4 pt-2 border-t border-gray-300 -mx-4 px-4 text-sm'
					style={{ width: 'calc(100% + 32px)' }}>
					<div className='flex flex-col gap-1'>
						<div className='text-gray'>{t('filter')}</div>
						<select
							className='px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							name='catSelect'
							id='catSelect'
							value={selectedCategory}
							onChange={e => handleSelectCategory(e.target.value)}>
							<option value='' className='text-gray-800 bg-white hover:bg-gray-100'>
								{t('all_categories')}
							</option>
							{CATEGORIES &&
								CATEGORIES.length > 0 &&
								CATEGORIES.map(c => (
									<option key={c.value} value={c.value} className='text-gray-800 bg-white hover:bg-gray-100'>
										{t(c.value)}
									</option>
								))}
						</select>
					</div>
					<div className='flex flex-col gap-1'>
						<div className='text-gray'>{t('sort_by')}</div>
						<select
							name='sortby'
							id='sortby'
							className='px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							value={sortBy}
							onChange={e => setSortBy(e.target.value as 'name' | 'category')}>
							<option value='name' className='text-gray-800 bg-white hover:bg-gray-100'>
								{t('name')}
							</option>
							<option value='category' className='text-gray-800 bg-white hover:bg-gray-100'>
								{t('category')}
							</option>
						</select>
					</div>
					<div className='flex flex-col gap-1'>
						<div className='text-gray'>{t('sort_direction')}</div>
						<select
							name='sortdir'
							id='sortdir'
							className='px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
							value={sortDir}
							onChange={e => setSortDir(e.target.value as 'asc' | 'desc')}>
							<option value='asc' className='text-gray-800 bg-white hover:bg-gray-100'>
								{t('ascending')}
							</option>
							<option value='desc' className='text-gray-800 bg-white hover:bg-gray-100'>
								{t('descending')}
							</option>
						</select>
					</div>
				</div>
			</div>
			{products && currentItems && currentItems.length > 0 ? (
				<div className='-mx-4 -mb-4'>
					<ProductsList products={currentItems} fetchProducts={fetchProducts} />
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
				<div className='-mx-4 mt-4 -mb-4 border-t border-zinc-300 rounded-b-2xl'>
					<Alert>
						<div>
							{t('add_product_to_your_database_or')}{' '}
							<Button variant='link' onClick={importDefaultData}>
								{t('import')}
							</Button>{' '}
							{t('default_data')}
						</div>
					</Alert>
				</div>
			)}
		</>
	)
}
