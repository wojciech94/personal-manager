import { useCallback, useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { API_URL } from '../../config'
import { Dashboards } from '../Navigation/Navigation'
import { Modal } from '../Modal/Modal'
import { Dropdown } from '../Dropdown/Dropdown'
import { ModalContext } from '../../contexts/ModalContext'
import { FetchDashboardsContext } from '../../contexts/FetchDashboardsContext'
import { Plus } from 'react-feather'
import { debounce, getScreenType, getTokenExpiration } from '../../utils/helpers'
import { WELCOME_SLIDES } from '../../constants/appConstants'
import { ModalDataProps } from '../Modal/types'
import { Button } from '../Button/Button'
import { ScreenContext } from '../../contexts/ScreenContext'
import { useApi } from '../../contexts/ApiContext'
import { ScreenType } from '../../types/global'
import { DashboardType } from '../../types/dashboard'

export const Home = () => {
	const [dashboards, setDashboards] = useState<DashboardType[]>([])
	const [activeModal, setActiveModal] = useState<ModalDataProps | null>(null)
	const [screenType, setScreenType] = useState<ScreenType>({ type: getScreenType() })
	const navigate = useNavigate()
	const location = useLocation()
	const isExactMatch = useMatch('/')
	const { accessToken, logout, fetchData, isRefreshing } = useApi()

	useEffect(() => {
		window.addEventListener('resize', debounce(handleResize, 1000))

		return () => window.removeEventListener('resize', handleResize)
	}, [])

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

	const handleResize = useCallback(() => {
		setScreenType({ type: getScreenType() })
	}, [])

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
			actionName: 'Create dashboard',
		},
		title: 'Create dashboard',
	}

	const openModal = () => {
		setActiveModal(createDashboardModalData)
	}

	const openNotifications = () => {
		navigate('/notifications')
	}

	const dropdownItems = [
		{ name: 'Notifications', action: openNotifications },
		{ name: 'Logout', action: logout },
	]

	return (
		<ScreenContext.Provider value={screenType}>
			<ModalContext.Provider value={{ activeModal, setActiveModal }}>
				<FetchDashboardsContext.Provider value={{ fetchUserDashboards }}>
					<div className='d-flex flex-column'>
						<header className='topbar'>
							<Link to={'/'}>
								<img src='/logo.png' width={40} alt='' />
							</Link>
							<div className='d-flex flex-1 justify-start align-center gap-4 scroll-x-auto'>
								<Dashboards dashboards={dashboards}></Dashboards>
							</div>
							<Button className='btn-mobile-icon' onClick={openModal}>
								<Plus size={16} />
								<span className='d-none d-inline-sm'>Add dashboard</span>
							</Button>
							<Dropdown items={dropdownItems}></Dropdown>
						</header>
						<main className='flex-1'>
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
		</ScreenContext.Provider>
	)
}

type WelcomeScreenProps = {
	isNew: boolean
	createDashboardModal: () => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ isNew, createDashboardModal }) => {
	const [mode, setMode] = useState(1)
	const slides = WELCOME_SLIDES

	useEffect(() => {
		const interval = setInterval(
			() =>
				setMode(prevMode => {
					if (prevMode === slides.length - 2) {
						setTimeout(() => setMode(0), 2500)
						return prevMode + 1
					}
					return (prevMode + 1) % slides.length
				}),
			8000
		)
		return () => {
			clearInterval(interval)
		}
	}, [])

	return (
		<div className='d-flex flex-column gap-4 m-5'>
			<div className='bg-welcome wrapper rounded-4 overflow-hidden d-flex flex-column flex-center shadow p-8'>
				<div className='max-w-95 bg-dark-transparent text-white p-8 rounded-4 m-10 fs-xl d-flex flex-column gap-3 align-center'>
					<h1>Organize your life like never before</h1>
					{isNew && <Button onClick={createDashboardModal}>Create your first dashboard</Button>}
				</div>
				<div className='carousel w-100 m-8'>
					<div
						className={`carousel-track w-100 ${mode === 0 ? 'transition-none' : ''}`}
						style={{ transform: `translateX(-${mode * 100}%)` }}>
						{slides &&
							slides.length > 0 &&
							slides.map((s, index) => (
								<div key={index} className='carousel-item'>
									<div
										className={`d-flex flex-column justify-evenly bg-white shadow w-50 rounded-3 p-8 fs-xl ${s.class}`}>
										<h2 className='text-center mb-8'>{s.title}</h2>
										<h3>{s.subtitle}</h3>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	)
}
