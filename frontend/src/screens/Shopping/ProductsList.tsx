import { useState, useEffect } from 'react'
import { ProductListItem } from '../../components/ProductListItem/ProductListItem'
import { useTranslation } from '../../contexts/TranslationContext'
import { Product } from './types'

export type UpdateProduct = Omit<Product, '_id'>

export function ProductsList({ products, fetchProducts }: { products: Product[]; fetchProducts: () => Promise<void> }) {
	const [productsData, setProductsData] = useState<Product[]>([])
	const { t } = useTranslation()

	useEffect(() => {
		setProductsData(products)
	}, [products])

	if (!products) {
		return null
	}

	return (
		<div className='products-list'>
			{productsData && productsData.length > 0 && (
				<>
					<div className='w-100 overflow-x-auto'>
						<table className='min-w-500px' cellSpacing={0}>
							<thead>
								<tr className='border-top border-bottom border-light bg-lighter text-bold'>
									<td style={{ width: '40px' }}></td>
									<td>{t('name').toUpperCase()}</td>
									<td>{t('category').toUpperCase()}</td>
									<td>{t('unit').toUpperCase()}</td>
									<td>{t('price').toUpperCase()}</td>
									<td className='d-none d-table-cell-sm'>{t('tags').toUpperCase()}</td>
									<td style={{ width: '85px' }}></td>
								</tr>
							</thead>
							<tbody>
								{productsData.map(p => (
									<ProductListItem
										key={p._id}
										product={p}
										productsData={productsData}
										setProductsData={setProductsData}
										fetchProducts={fetchProducts}
									/>
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	)
}
