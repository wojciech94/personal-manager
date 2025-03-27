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
				<NavLink to={'list'} className='text-gray-700 font-semibold hover:text-blue-500 focus:outline-none'>
					{t('lists')}
				</NavLink>
				<NavLink
					to={'products'}
					className='px-2 py-1 text-gray-600 font-semibold hover:text-blue-500 focus:outline-none'>
					{t('products')}
				</NavLink>
			</div>
			<Card contentClass='border-0'>{<Outlet />}</Card>
		</>
	)
}
