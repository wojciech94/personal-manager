import { useEffect } from 'react'
import { useState } from 'react'
import { Check, Edit, Trash2 } from 'react-feather'
import { Product, ShoppingProductProps } from '../../screens/Shopping/types'
import { Button } from '../Button/Button'

export function ShoppingProduct({ data, onListItemUpdate, onListItemDelete }: ShoppingProductProps) {
	const [product, setProduct] = useState<Product>(data.productId)
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
			setProduct(data.productId)
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
				<tr className={`border-b border-light ${isPurchasedValue ? 'text-gray' : ''}`}>
					<td className='table-cell text-center'>
						<input
							type='checkbox'
							name='isPurchasedChbx'
							className='w-4 h-4 bg-gray-100 border-gray-300'
							id={`isPurchased${data._id}`}
							style={{ verticalAlign: 'middle' }}
							checked={isPurchasedValue}
							onChange={handleCheckItem}
						/>
					</td>
					<td className='table-cell text-start'>{<label htmlFor={`isPurchased${data._id}`}>{product.name}</label>}</td>
					<td className='table-cell text-center'>
						{editedId && editedId === data._id ? (
							<div className='flex justify-center gap-1'>
								<input
									className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-full'
									type='text'
									value={quantityValue}
									onChange={e => setQuantityValue(e.target.value)}
								/>
								<input
									className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-full'
									type='text'
									value={unitValue}
									onChange={e => setUnitValue(e.target.value)}
								/>
							</div>
						) : (
							<>{`${data.quantity} ${data.customUnit}`}</>
						)}
					</td>
					<td className='table-cell text-center'>
						{editedId && editedId === data._id ? (
							<input
								className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-full'
								type='text'
								value={priceValue}
								onChange={e => setPriceValue(e.target.value)}></input>
						) : (
							data.customPrice
						)}
					</td>
					<td className='table-cell text-center'>
						{editedId && editedId === data._id ? (
							<textarea
								className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[42px] w-full max-w-full'
								value={notesValue}
								onChange={e => setNotesValue(e.target.value)}></textarea>
						) : (
							data.notes
						)}
					</td>
					<td className='table-cell'>
						<div className='flex gap-2'>
							{editedId && editedId === data._id ? (
								<Button onlyIcon={true} variant='success' onClick={handleListItemUpdate}>
									<Check size={16} />
								</Button>
							) : (
								<Button onlyIcon={true} onClick={() => setEditedId(data._id)}>
									<Edit size={16} />
								</Button>
							)}
							<Button onlyIcon={true} variant='danger' onClick={deleteProduct}>
								<Trash2 size={16} />
							</Button>
						</div>
					</td>
				</tr>
			)}
		</>
	)
}
