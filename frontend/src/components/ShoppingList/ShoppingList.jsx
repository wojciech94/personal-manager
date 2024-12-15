import { useContext } from 'react'
import { ModalContext } from '../../contexts/ModalContext'
import { ExpandableMenu } from '../ExpandableMenu.jsx/ExpandableMenu'

export function ShoppingList() {
	const [, setActiveModal] = useContext(ModalContext)
	const menuItems = [
		{
			label: 'Add item',
			action: () =>
				setActiveModal({
					name: 'addListItem',
					data: {
						action: () => console.log('actrion'),
					},
					title: 'Add item to list',
				}),
		},
	]
	return (
		<>
			<div className='d-flex gap-3 justify-between align-center'>
				<div className='card-title'>Shopping list</div>
				<div className='d-flex gap-2 align-center'>
					<ExpandableMenu items={menuItems} />
				</div>
			</div>
			<div></div>
		</>
	)
}
