import { useContext } from 'react'
import { Plus } from 'react-feather'
import { useLoaderData } from 'react-router-dom'
import { ModalContext } from '../../contexts/ModalContext'
import { ShoppingProduct } from '../ShoppingProduct/ShoppingProduct'

export function ShoppingList() {
	const data = useLoaderData()
	const [, setActiveModal] = useContext(ModalContext)

	const openAddItemModal = () => {
		const modalData = {
			name: 'addShoppingItem',
			data: {
				action: () => console.log('addShoppingItem'),
			},
			title: 'Add shopping item',
		}
		setActiveModal(modalData)
	}

	return (
		<>
			{data && (
				<>
					<div className='mt-4 mb-4 d-flex gap-2 justify-between align-center'>
						<div className='d-flex flex-column gap-1'>
							<div>{data.name}</div>
							<div className='text-gray fs-sm'>Last update: {data.updatedAt.split('.')[0].replace('T', ' ')}</div>
						</div>
						<button className='btn btn-primary d-flex align-center gap-2' onClick={openAddItemModal}>
							<Plus size={16} />
							Add item
						</button>
					</div>
					<div className='mx-n4 mb-n4'>
						<table cellSpacing={0}>
							<thead className='bg-lighter'>
								<tr className='border-top border-bottom border-light'>
									<th style={{ width: '25px' }}></th>
									<th>Name</th>
									<th>{'Quantity [unit]'}</th>
									<th>Price</th>
									<th>Notes</th>
									<th style={{ width: '85px' }}></th>
								</tr>
							</thead>
							<tbody>{data.list && data.list.length > 0 && data.list.map(p => <ShoppingProduct data={p} />)}</tbody>
						</table>
					</div>
				</>
			)}
		</>
	)
}
