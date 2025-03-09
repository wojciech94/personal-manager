import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from '../contexts/TranslationContext'

export const Community = () => {
	const { t } = useTranslation()

	return (
		<div className='d-flex flex-column gap-4'>
			<div className='text-lg d-flex gap-3 align-center'>
				<NavLink to={'posts'}>{t('posts')}</NavLink>
				<NavLink to={'polls'}>{t('polls')}</NavLink>
			</div>
			{<Outlet />}
		</div>
	)
}
