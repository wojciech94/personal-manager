import { useEffect, useState } from 'react'
import { Button } from '../components/Button/Button'
import { WELCOME_SLIDES } from '../constants/appConstants'
import { useTranslation } from '../contexts/TranslationContext'

export type WelcomeScreenProps = {
	isNew: boolean
	createDashboardModal: () => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ isNew, createDashboardModal }) => {
	const [mode, setMode] = useState(1)
	const slides = WELCOME_SLIDES
	const { t } = useTranslation()

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
					<h1>{t('organize_your_life')}</h1>
					{isNew && <Button onClick={createDashboardModal}>{t('create_first_dashboard')}</Button>}
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
										<h2 className='text-center mb-8'>{t(`${s.key}_title`)}</h2>
										<h3>{t(`${s.key}_subtitle`)}</h3>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	)
}
