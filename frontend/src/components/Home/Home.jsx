import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
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
			<div className='topbar'>
				<div className='d-flex flex-1 justify-center'>
					<Dashboards dashboards={dashboards}></Dashboards>
					<button className='btn btn-primary d-flex gap-2 align-center' onClick={openModal}>
						<Plus size={16} /> Add dashboard
					</button>
				</div>
				<Dropdown title='User' items={dropdownItems}></Dropdown>
			</div>
			<div>
				<Outlet />
			</div>
			{activeModal && (
				<Modal modalName={activeModal.name} modalTitle={activeModal.title} modalData={activeModal.data} />
			)}
		</ModalContext.Provider>
	)
}
