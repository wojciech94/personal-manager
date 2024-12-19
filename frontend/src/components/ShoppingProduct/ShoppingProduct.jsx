import { useState } from 'react'
import { Check, Edit, Trash2 } from 'react-feather'
import { useNavigate, useParams } from 'react-router-dom'
import { API_URL } from '../../config'

export function ShoppingProduct({ data }) {
	const [product, setProduct] = useState(data.productId)
	const { shoppingListId } = useParams()
	const [editedId, setEditedId] = useState(null)
	const navigate = useNavigate()

	const deleteProduct = async () => {
		const token = localStorage.getItem('token')
		console.log(data._id)
		if (token) {
			const res = await fetch(`${API_URL}shoppingLists/${shoppingListId}/shopping-items/${data._id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			if (!res.ok) {
				const errorData = await res.json()
				console.error(errorData.message)
			} else {
				navigate('.', { replace: true })
			}
		}
	}

	return (
		<>
			{data && (
				<tr className='border-bottom border-light'>
					<td>
						<input type='checkbox' name='isPurchasedChbx' id='isPurchasedChbx' style={{ verticalAlign: 'middle' }} />
					</td>
					<td>{product.name}</td>
					<td>{`${data.quantity} ${data.customUnit}`}</td>
					<td>{data.customPrice}</td>
					<td>{data.notes}</td>
					<td>
						<div className='d-flex gap-2'>
							{editedId && editedId === data._id ? (
								<button className='btn btn-icon btn-success' onClick={() => setEditedId(null)}>
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
