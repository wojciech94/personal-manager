import { useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card/Card'
import { useTranslation } from '../../contexts/TranslationContext'

export function Shopping() {
	const navigate = useNavigate()
	const { t } = useTranslation()

	useEffect(() => {
		navigate('list')
	}, [])

	return (
		<>
			<div className='flex gap-3 items-center mb-2 text-lg'>
				<NavLink
					to={'list'}
					className={({ isActive }) =>
						` font-semibold hover:text-blue-500 focus:outline-none ${isActive ? 'text-blue-500' : 'text-gray-700'}`
					}>
					{t('lists')}
				</NavLink>
				<NavLink
					to={'products'}
					className={({ isActive }) =>
						` font-semibold hover:text-blue-500 focus:outline-none ${isActive ? 'text-blue-500' : 'text-gray-700'}`
					}>
					{t('products')}
				</NavLink>
			</div>
			<Card contentClass='border-0'>{<Outlet />}</Card>
		</>
	)
}
