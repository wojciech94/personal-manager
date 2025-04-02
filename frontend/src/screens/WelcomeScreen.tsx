import React, { useEffect, useState } from 'react'
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
		<div className='flex flex-col gap-4 m-5'>
			<div className='w-[95%] max-w-[1400px] my-0 mx-auto bg-center bg-cover rounded-xl overflow-hidden flex flex-col justify-center items-center shadow-xl p-8 border border-zinc-300 bg-[url(/personal-manager-welcome-v2.jpg)]'>
				<div className='max-w-[95%] bg-black bg-opacity-75 text-white p-8 rounded-xl m-10 text-4xl font-semibold flex flex-col gap-3 items-center'>
					<h1>{t('organize_your_life')}</h1>
					{isNew && <Button onClick={createDashboardModal}>{t('create_first_dashboard')}</Button>}
				</div>
				<div className='w-full m-8 flex relative overflow-hidden'>
					<div
						className={`w-full flex transition-transform ease-in-out duration-1000 ${
							mode === 0 ? 'transition-none' : ''
						}`}
						style={{ transform: `translateX(-${mode * 100}%)` }}>
						{slides &&
							slides.length > 0 &&
							slides.map((s, index) => (
								<div key={index} className='min-w-full flex justify-center'>
									<div
										className={`flex flex-col justify-evenly bg-white shadow w-[85%] max-w-[650px] rounded-lg p-8 ${s.class}`}
										style={{ background: s.background }}>
										<h2 className='text-center mb-8 text-3xl font-semibold'>{t(`${s.key}_title`)}</h2>
										<h3 className='text-2xl font-medium'>{t(`${s.key}_subtitle`)}</h3>
									</div>
								</div>
							))}
					</div>
				</div>
			</div>
		</div>
	)
}
