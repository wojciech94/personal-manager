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
			<div className='d-flex gap-3 align-center mb-4 text-lg'>
				<NavLink to={'list'} className='btn btn-link'>
					{t('lists')}
				</NavLink>
				<NavLink to={'products'} className='btn btn-link'>
					{t('products')}
				</NavLink>
			</div>
			<Card contentClass='border-none'>{<Outlet />}</Card>
		</>
	)
}
