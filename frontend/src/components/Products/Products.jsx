import { useEffect, useState } from 'react'
import { useContext } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { ModalContext } from '../../contexts/ModalContext'
import { ExpandableMenu } from '../ExpandableMenu.jsx/ExpandableMenu'

export function Products() {
	const [, setActiveModal] = useContext(ModalContext)
	const [products, setProducts] = useState([])
	const { dashboardId } = useParams()

	const fetchProducts = async () => {
		const token = localStorage.getItem('token')
		if (!token) {
			console.error('No token found in localStorage')
		}
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/products`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		if (res.ok) {
			const data = await res.json()
			if (data) {
				console.log(data)
				setProducts(data)
			}
		} else {
			const errorData = await res.json()
			console.error(errorData.message)
		}
	}

	useEffect(() => {
		fetchProducts()
	}, [])

	const menuItems = [
		{
			label: 'Add product',
			action: () =>
				setActiveModal({
					title: 'Add product',
					data: { action: fetchProducts },
					name: 'addProduct',
				}),
		},
	]

	return (
		<>
			<div className='d-flex justify-between align-center gap-3'>
				<div className='card-title'>Products</div>
				<ExpandableMenu items={menuItems} />
			</div>
			{products && products.length > 0 && (
				<div>
					{products.map(p => (
						<div key={p._id}>{p.name}</div>
					))}
				</div>
			)}
		</>
	)
}
