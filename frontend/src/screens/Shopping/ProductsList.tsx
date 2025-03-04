import { useState, useEffect } from 'react'
import { Product } from './Products'
import { ProductListItem } from '../../components/ProductListItem/ProductListItem'

export type UpdateProduct = Omit<Product, '_id'>

export function ProductsList({ products }: { products: Product[] }) {
	const [productsData, setProductsData] = useState<Product[]>([])

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
									<td>NAME</td>
									<td>CATEGORY</td>
									<td>UNIT</td>
									<td>PRICE</td>
									<td className='d-none d-table-cell-sm'>TAGS</td>
									<td style={{ width: '85px' }}></td>
								</tr>
							</thead>
							<tbody>
								{productsData.map(p => (
									<ProductListItem product={p} productsData={productsData} setProductsData={setProductsData} />
								))}
							</tbody>
						</table>
					</div>
				</>
			)}
		</div>
	)
}
