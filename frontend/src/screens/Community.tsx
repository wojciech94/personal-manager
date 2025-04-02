import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from '../contexts/TranslationContext'

export const Community = () => {
	const { t } = useTranslation()

	return (
		<div className='flex flex-col gap-4'>
			<div className='text-lg flex gap-3 items-center'>
				<NavLink to={'posts'}>{t('posts')}</NavLink>
				<NavLink to={'polls'}>{t('polls')}</NavLink>
			</div>
			{<Outlet />}
		</div>
	)
}
