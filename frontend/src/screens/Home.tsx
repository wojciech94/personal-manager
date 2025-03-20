import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { Dashboards } from '../components/Navigation/Navigation'
import { Modal } from '../components/Modal/Modal'
import { Dropdown } from '../components/Dropdown/Dropdown'
import { ModalContext } from '../contexts/ModalContext'
import { FetchDashboardsContext } from '../contexts/FetchDashboardsContext'
import { Plus } from 'react-feather'
import { WELCOME_SLIDES } from '../constants/appConstants'
import { ModalDataProps } from '../components/Modal/types'
import { Button } from '../components/Button/Button'
import { useApi } from '../contexts/ApiContext'
import { DashboardType } from '../types/dashboard'
import { Notification } from '../components/Notifications/types'
import { useTranslation } from '../contexts/TranslationContext'
import { WelcomeScreen } from './WelcomeScreen'

export const Home = () => {
	const [dashboards, setDashboards] = useState<DashboardType[]>([])
	const [activeModal, setActiveModal] = useState<ModalDataProps | null>(null)
	const [hasNotifications, setHasNotifications] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	const isExactMatch = useMatch('/')
	const { accessToken, logout, fetchData, isRefreshing } = useApi()
	const { t, setLanguage, language } = useTranslation()

	useEffect(() => {
		if (isExactMatch) {
			fetchNotifications()
		}
	}, [location])

	useEffect(() => {
		if (!accessToken && !isRefreshing) {
			navigate('/login')
		}
	}, [accessToken, navigate, isRefreshing])

	useEffect(() => {
		if (accessToken && !isRefreshing) {
			fetchUserDashboards()
		}
	}, [accessToken, isRefreshing, location.pathname])

	const fetchNotifications = async () => {
		const url = `${API_URL}notifications`

		const response = await fetchData<Notification[]>(url)

		if (response.error) {
			console.error('Failed to fetch notifications:', response.status, response.error)
			return
		}

		if (response.data) {
			const data = response.data
			setHasNotifications(data.length > 0 ? true : false)
		}
	}

	const fetchUserDashboards = async () => {
		try {
			const url = `${API_URL}dashboards`
			const result = await fetchData<DashboardType[]>(url)

			if (result.error) {
				console.error('Failed to fetch dashboards:', result.status, result.error)
				return
			}

			if (result.data) {
				setDashboards(result.data)
			}
		} catch (error) {
			console.error('Unexpected error while fetching dashboards:', error)
		}
	}

	const createDashboard = async (dashboardName: string | undefined): Promise<void> => {
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name: dashboardName }),
		}
		const response = await fetchData<DashboardType>(`${API_URL}dashboards`, options)

		if (response.error) {
			console.error('Failed to create dashboard:', response.status, response.error)
			return
		}

		if (response.data) {
			const newDashboard = response.data
			setActiveModal(null)
			setDashboards(prev => [...prev, newDashboard])
		}
	}

	const createDashboardModalData: ModalDataProps = {
		name: 'createDashboard',
		data: {
			action: createDashboard,
			actionName: t('create_dashboard'),
		},
		title: t('create_dashboard'),
	}

	const changeLanguage = () => {
		setLanguage(language === 'en' ? 'pl' : 'en')
	}

	const openModal = () => {
		setActiveModal(createDashboardModalData)
	}

	const openNotifications = () => {
		navigate('/notifications')
	}

	const dropdownItems = [
		{ name: t('notifications'), action: openNotifications },
		{ name: `${t('language')} (${language.toUpperCase()})`, action: changeLanguage },
		{ name: t('logout'), action: logout },
	]

	return (
		<ModalContext.Provider value={{ activeModal, setActiveModal }}>
			<FetchDashboardsContext.Provider value={{ fetchUserDashboards }}>
				<div className='d-flex flex-column flex-1'>
					<header className='topbar'>
						<Link to={'/'}>
							<img src='/logo.png' width={40} alt='' />
						</Link>
						<div className='d-flex flex-1 justify-start align-center gap-4 scroll-x-auto'>
							<Dashboards dashboards={dashboards}></Dashboards>
						</div>
						<Button className='btn-mobile-icon' onClick={openModal}>
							<Plus size={16} />
							<span className='d-none d-inline-sm'>{t('add_dashboard')}</span>
						</Button>
						<Dropdown items={dropdownItems} hasNotifications={hasNotifications}></Dropdown>
					</header>
					<main className='flex flex-1 justify-center'>
						{isExactMatch ? (
							<WelcomeScreen isNew={dashboards.length === 0} createDashboardModal={openModal} />
						) : (
							<Outlet />
						)}
					</main>
					{activeModal && <Modal name={activeModal.name} title={activeModal.title} data={activeModal.data} />}
				</div>
			</FetchDashboardsContext.Provider>
		</ModalContext.Provider>
	)
}
