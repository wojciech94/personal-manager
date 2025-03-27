import { Plus } from 'react-feather'
import { useLoaderData, useParams, useRevalidator } from 'react-router-dom'
import { API_URL } from '../../config'
import { Alert } from '../../components/Alert/Alert'
import { useModalContext } from '../../contexts/ModalContext'
import { ShoppingProduct } from '../../components/ShoppingProduct/ShoppingProduct'
import { getLocaleDateTime } from '../../utils/datetime'
import { Button } from '../../components/Button/Button'
import { useApi } from '../../contexts/ApiContext'
import { useTranslation } from '../../contexts/TranslationContext'
import { useEffect, useState } from 'react'
import { IsShoppingPurchased, Product, ShoppingItem, ShoppingListType } from './types'

export function ShoppingList() {
	const data: ShoppingListType = useLoaderData() as ShoppingListType
	const [shoppingList, setShoppingList] = useState<ShoppingListType | null>(null)
	const [hasProducts, setHasProducts] = useState(false)
	const { setActiveModal } = useModalContext()
	const { shoppingListId, dashboardId } = useParams()
	const { revalidate } = useRevalidator()
	const { fetchData } = useApi()
	const { t } = useTranslation()
	const productsToBuy = data.list.filter(p => p.isPurchased === false).length

	useEffect(() => {
		const getProductsCount = async () => {
			const url = `${API_URL}dashboards/${dashboardId}/products`

			const response = await fetchData<Product[]>(url)

			if (response.error) {
				console.error('Failed to fetch products:', response.status, response.error)
				return
			}

			if (response.data) {
				const data: Product[] = response.data
				if (data && data.length > 0) {
					setHasProducts(true)
				}
			}
		}

		getProductsCount()
	}, [])

	useEffect(() => {
		const sortedList = [...data.list].sort((a, b) => {
			return Number(a.isPurchased) - Number(b.isPurchased)
		})
		setShoppingList({ ...data, list: sortedList })
	}, [data])

	const openAddItemModal = () => {
		const modalData = {
			name: 'addShoppingItem',
			title: t('add_shopping_item'),
		}
		setActiveModal(modalData)
	}

	const handleUpdateListItem = async (id: string, data: ShoppingItem | IsShoppingPurchased) => {
		const url = `${API_URL}dashboards/${dashboardId}/shoppingLists/${shoppingListId}/shopping-items/${id}`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		}
		const response = await fetchData<ShoppingListType>(url, options)

		if (response.error) {
			console.error('Failed to update shopping list:', response.status, response.error)
			return
		}

		revalidate()
	}

	const handleDeleteListItem = async (id: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/shoppingLists/${shoppingListId}/shopping-items/${id}`
		const options = {
			method: 'DELETE',
		}

		const response = await fetchData<ShoppingListType>(url, options)

		if (response.error) {
			console.error('Failed to delete item:', response.status, response.error)
			return
		}

		revalidate()
	}

	const calculateSum = () => {
		if (!data || !Array.isArray(data.list)) {
			return 0
		}

		return data.list
			.reduce((acc, currentVal) => {
				return acc + Number(currentVal.customPrice) * Number(currentVal.quantity)
			}, 0)
			.toFixed(2)
	}

	if (!hasProducts) {
		return (
			<Alert className='mb-0 mx-0'>
				<div>{t('you_dont_have_products_in_database')}</div>
			</Alert>
		)
	}

	if (!data) {
		return (
			<Alert className='mb-0 mx-0'>
				<div>{t('your_shopping_list_is_empty')}</div>
			</Alert>
		)
	}

	return (
		<>
			<div className='mt-4 mb-4 flex gap-2 justify-between items-center'>
				<div className='flex flex-col gap-1'>
					<div>
						{t('left_to_buy')} {productsToBuy} {`${productsToBuy === 1 ? t('product') : t('products')}`}
					</div>
					<div className='text-gray fs-sm'>
						{t('last_update')} {getLocaleDateTime(data.updatedAt)}
					</div>
				</div>
				<Button className='sm:inline-flex p-2 text-nowrap' onClick={openAddItemModal}>
					<Plus size={16} />
					{t('add_item')}
				</Button>
			</div>
			{shoppingList && shoppingList.list && shoppingList.list.length > 0 ? (
				<div className='-mx-4 -mb-4'>
					<table cellSpacing={0} className='w-full overflow-hidden rounded-b-lg'>
						<thead className='bg-slate-100'>
							<tr className='border-t border-b border-light'>
								<th style={{ width: '30px' }}></th>
								<th>{t('name')}</th>
								<th>{`${t('quantity')} [${t('unit')}]`}</th>
								<th>{t('price_per_unit')}</th>
								<th>{t('notes')}</th>
								<th style={{ width: '85px' }}></th>
							</tr>
						</thead>
						<tbody>
							{shoppingList.list.map(p => (
								<ShoppingProduct
									key={p._id}
									data={p}
									onListItemUpdate={handleUpdateListItem}
									onListItemDelete={handleDeleteListItem}
								/>
							))}
						</tbody>
						<tfoot>
							<tr className='bg-slate-100 border-t border-light font-semibold'>
								<td colSpan={2} className='px-2'>
									{t('summary')}
								</td>
								<td className='text-end'>{t('products_value')}</td>
								<td colSpan={3}>{calculateSum()}</td>
							</tr>
						</tfoot>
					</table>
				</div>
			) : (
				<div className='-mx-4 -mb-4 border-t border-light'>
					<Alert>
						<div>{t('your_shopping_list_is_empty_add_item')}</div>
					</Alert>
				</div>
			)}
		</>
	)
}
