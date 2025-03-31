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
		<div className='mt-4 overflow-x-auto'>
			{productsData && productsData.length > 0 && (
				<>
					<div className='w-full overflow-x-auto'>
						<table className='w-full overflow-hidden rounded-b-2xl border-collapse' cellSpacing={0}>
							<thead>
								<tr className='border-t border-b border-zinc-400 bg-slate-200 font-semibold'>
									<td className='table-cell' style={{ width: '40px' }}></td>
									<td className='table-cell'>{t('name').toUpperCase()}</td>
									<td className='table-cell'>{t('category').toUpperCase()}</td>
									<td className='table-cell text-center'>{t('unit').toUpperCase()}</td>
									<td className='table-cell text-center'>{t('price').toUpperCase()}</td>
									<td className='hidden	px-2 py-1 first:pl-4 last:pr-4 sm:table-cell'>{t('tags').toUpperCase()}</td>
									<td className='table-cell' style={{ width: '85px' }}></td>
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
