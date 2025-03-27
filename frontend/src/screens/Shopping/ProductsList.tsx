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
		<div className='mt-4'>
			{productsData && productsData.length > 0 && (
				<>
					<div className='w-full overflow-x-auto'>
						<table className='w-full min-w-[500px]' cellSpacing={0}>
							<thead>
								<tr className='border-t border-b border-zinc-400 bg-zinc-200 font-semibold'>
									<td style={{ width: '40px' }}></td>
									<td>{t('name').toUpperCase()}</td>
									<td>{t('category').toUpperCase()}</td>
									<td>{t('unit').toUpperCase()}</td>
									<td>{t('price').toUpperCase()}</td>
									<td className='hidden	sm:table-cell'>{t('tags').toUpperCase()}</td>
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
