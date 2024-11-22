import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { Dashboards } from '../Dashboards/Dashboards'
import { Modal } from '../Modal/Modal'
import { Dropdown } from '../Dropdown/Dropdown'
import { ModalContext } from '../../contexts/ModalContext'
import { Plus } from 'react-feather'
import { getTokenExpiration } from '../../utils/helpers'

export const Home = () => {
	const [dashboards, setDashboards] = useState([])
	const [activeModal, setActiveModal] = useState(false)
	const navigate = useNavigate()
	const location = useLocation()
	const isExactMatch = useMatch('/')

	useEffect(() => {
		fetchUserDashboards()
	}, [location.pathname])

	useEffect(() => {
		let tokenTimeout
		const checkToken = () => {
			const token = localStorage.getItem('token')
			if (token) {
				const remainingTime = getTokenExpiration(token) - new Date().getTime()
				if (remainingTime < 60 * 1000) {
					logout()
				}
				tokenTimeout = setTimeout(checkToken, remainingTime)
				console.log(`Remaining time: ${Math.floor(remainingTime / 60000)} min`)
			}
		}

		checkToken()

		return () => clearTimeout(tokenTimeout)
	}, [])

	const fetchUserDashboards = async () => {
		const token = localStorage.getItem('token') // Upewnij się, że token jest przechowywany po zalogowaniu

		const response = await fetch('http://localhost:5000/dashboards', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
		})

		if (response.ok) {
			const dashboards = await response.json()
			setDashboards(dashboards)
		} else {
			console.error('Failed to fetch dashboards:', response.status)
		}
	}

	const openModal = () => {
		setActiveModal({
			name: 'createDashboard',
			data: {
				action: createDashboard,
				actionName: 'Create dashboard',
			},
			title: 'Create dashboard',
		})
	}

	const createDashboard = async dashboardName => {
		const response = await fetch('http://localhost:5000/dashboards', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${localStorage.getItem('token')}`, // Dodaj token w nagłówkach
			},
			body: JSON.stringify({ name: dashboardName }),
		})

		if (response.ok) {
			const newDashboard = await response.json()
			console.log('Dashboard created:', newDashboard)
			setActiveModal(null)
			fetchUserDashboards()
		} else {
			const errorData = await response.json()
			console.error(errorData.message)
		}
	}

	const goToSettings = () => {
		navigate('/settings')
	}

	const logout = () => {
		localStorage.removeItem('token')
		navigate('/login')
	}

	const dropdownItems = [
		{
			name: 'Settings',
			action: goToSettings,
		},
		{ name: 'Logout', action: logout },
	]

	return (
		<ModalContext.Provider value={[activeModal, setActiveModal]}>
			<div className='d-flex flex-column'>
				<div className='topbar'>
					<Link to={'/'}>
						<img src='/logo.png' width={40} alt='' />
					</Link>
					<div className='d-flex flex-1 justify-center'>
						<Dashboards dashboards={dashboards}></Dashboards>
						<button className='btn btn-primary d-flex gap-2 align-center' onClick={openModal}>
							<Plus size={16} /> Add dashboard
						</button>
					</div>
					<Dropdown title='User' items={dropdownItems}></Dropdown>
				</div>
				<div className='flex-1'>{isExactMatch ? <WelcomeScreen isNew={dashboards.length === 0} /> : <Outlet />}</div>
				{activeModal && (
					<Modal modalName={activeModal.name} modalTitle={activeModal.title} modalData={activeModal.data} />
				)}
			</div>
		</ModalContext.Provider>
	)
}

const WelcomeScreen = ({ isNew }) => {
	const [mode, setMode] = useState(1)
	const slides = [
		{
			title: 'Save your notes',
			subtitle: 'Quickly note ideas, thoughts and reminders.',
			class: 'gradient-0',
		},
		{
			title: 'Plan your tasks',
			subtitle: 'Stay organized by managing your daily tasks and to-dos.',
			class: 'gradient-1',
		},
		{
			title: 'Create shopping list',
			subtitle: 'Make sure you never forget anything with your shopping lists.',
			class: 'gradient-2',
		},
		{
			title: 'Share dashboards with others',
			subtitle: 'Collaborate with team members by sharing your dashboards.',
			class: 'gradient-4',
		},
		{
			title: 'Save your notes',
			subtitle: 'Quickly note ideas, thoughts and reminders.',
			class: 'gradient-0',
		},
	]

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
				<div className='max-w-95 bg-dark-transparent text-white p-8 rounded-4 m-10 fs-xl'>
					<h1>Organize your life like never before</h1>
					{isNew && <button className='btn btn-primary w-100 mt-4'>Create your first dashboard</button>}
				</div>
				<div className='carousel w-100 m-8'>
					<div
						className={`carousel-track w-100 ${mode === 0 ? 'transition-none' : ''}`}
						style={{ transform: `translateX(-${mode * 100}%)` }}>
						{slides &&
							slides.length > 0 &&
							slides.map(s => (
								<div className='carousel-item'>
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
