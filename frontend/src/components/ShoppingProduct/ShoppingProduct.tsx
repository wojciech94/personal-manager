import { useEffect } from 'react'
import { useState } from 'react'
import { Check, Edit, Trash2 } from 'react-feather'
import { IsShoppingPurchased, ShoppingItem } from '../ShoppingList/ShoppingList'

type ShoppingItemToUpdate = Omit<ShoppingItem, '_id'>

type Props = {
	data: ShoppingItem
	onListItemUpdate: (_id: string, data: ShoppingItemToUpdate | IsShoppingPurchased) => Promise<void>
	onListItemDelete: (_id: string) => void
}

export function ShoppingProduct({ data, onListItemUpdate, onListItemDelete }: Props) {
	const [product, setProduct] = useState(data.productId)
	const [editedId, setEditedId] = useState<string | null>(null)
	const [isPurchasedValue, setIsPurchasedValue] = useState(data.isPurchased)
	const [quantityValue, setQuantityValue] = useState(data.quantity)
	const [notesValue, setNotesValue] = useState(data.notes)
	const [unitValue, setUnitValue] = useState(data.customUnit)
	const [priceValue, setPriceValue] = useState(data.customPrice)

	const updateData = {
		quantity: quantityValue,
		notes: notesValue,
		customUnit: unitValue,
		customPrice: priceValue,
		isPurchased: isPurchasedValue,
	}

	useEffect(() => {
		if (editedId) {
			setQuantityValue(data.quantity)
			setNotesValue(data.notes)
			setUnitValue(data.customUnit)
			setPriceValue(data.customPrice)
		}
	}, [editedId])

	const deleteProduct = () => {
		onListItemDelete(data._id)
	}

	const handleListItemUpdate = () => {
		onListItemUpdate(data._id, updateData)
		setEditedId(null)
	}

	const handleCheckItem = () => {
		setIsPurchasedValue(prevState => {
			onListItemUpdate(data._id, { isPurchased: !prevState })
			return !prevState
		})
	}

	return (
		<>
			{data && (
				<tr className={`border-bottom border-light ${isPurchasedValue ? 'text-gray' : ''}`}>
					<td className='text-center'>
						<input
							type='checkbox'
							name='isPurchasedChbx'
							id={`isPurchased${data._id}`}
							style={{ verticalAlign: 'middle' }}
							checked={isPurchasedValue}
							onChange={handleCheckItem}
						/>
					</td>
					<td>{<label htmlFor={`isPurchased${data._id}`}>{product.name}</label>}</td>
					<td>
						{editedId && editedId === data._id ? (
							<div className='d-flex gap-1'>
								<input type='text' value={quantityValue} onChange={e => setQuantityValue(Number(e.target.value))} />
								<input type='text' value={unitValue} onChange={e => setUnitValue(e.target.value)} />
							</div>
						) : (
							<>{`${data.quantity} ${data.customUnit}`}</>
						)}
					</td>
					<td>
						{editedId && editedId === data._id ? (
							<input type='text' value={priceValue} onChange={e => setPriceValue(Number(e.target.value))}></input>
						) : (
							data.customPrice
						)}
					</td>
					<td>
						{editedId && editedId === data._id ? (
							<textarea className='w-100' value={notesValue} onChange={e => setNotesValue(e.target.value)}></textarea>
						) : (
							data.notes
						)}
					</td>
					<td>
						<div className='d-flex gap-2'>
							{editedId && editedId === data._id ? (
								<button className='btn btn-icon btn-success' onClick={handleListItemUpdate}>
									<Check size={16} />
								</button>
							) : (
								<button className='btn btn-icon btn-primary' onClick={() => setEditedId(data._id)}>
									<Edit size={16} />
								</button>
							)}

							<button className='btn btn-icon btn-danger' onClick={deleteProduct}>
								<Trash2 size={16} />
							</button>
						</div>
					</td>
				</tr>
			)}
		</>
	)
}
