import { FormEvent, useEffect, useState } from 'react'
import { AlertTriangle, Eye, EyeOff } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { Button } from '../components/Button/Button'
import { Card } from '../components/Card/Card'
import { useApi } from '../contexts/ApiContext'
import { ApiError } from '../types/global'
import { useTranslation } from '../contexts/TranslationContext'
import { GB, PL } from 'country-flag-icons/react/1x1'

export const Login = () => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [mode, setMode] = useState('signIn')
	const [message, setMessage] = useState('')
	const [isLoading, setIsloading] = useState(false)
	const [showLoadingMessage, setShowLoadingMessage] = useState(false)
	const { login } = useApi()
	const { language, setLanguage, t } = useTranslation()
	const navigate = useNavigate()

	useEffect(() => {
		let timeout: number
		if (isLoading) {
			timeout = window.setTimeout(() => setShowLoadingMessage(true), 5000)
		}

		return () => {
			if (timeout) clearTimeout(timeout)
		}
	}, [isLoading])

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsloading(true)

		try {
			const response = await fetch(`${API_URL}auth/${mode === 'signIn' ? 'login' : 'register'}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name: username, password }),
				credentials: 'include',
			})

			console.log('Response status:', response.status)
			const text = await response.text()
			console.log('Response text:', text)

			if (!response.ok && mode === 'signIn') {
				throw new Error('Invalid credentials')
			} else if (!response.ok && mode === 'signUp') {
				throw new Error('Server error')
			}

			if (!text) {
				throw new Error('Empty response from server')
			}

			const { accessToken, name }: { accessToken: string; name: string } = JSON.parse(text)

			if (!accessToken || !name) {
				throw new Error('Invalid response from server')
			}

			if (mode === 'signIn') {
				login(accessToken)
				setMessage('Login successfull')
				navigate('/')
				sessionStorage.setItem('name', name)
			} else {
				setMessage('Register successful')
				setMode('signIn')
			}
			setUsername('')
			setPassword('')
		} catch (error) {
			if (error instanceof Error) {
				setMessage(error.message)
			}
		} finally {
			setIsloading(false)
		}
	}

	const handleTestLogin = async () => {
		try {
			setIsloading(true)
			const res = await fetch(`${API_URL}auth/testlogin`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
			})

			if (!res.ok) {
				const errorData: ApiError = await res.json()
				setMessage(errorData.message)
				setIsloading(false)
				return
			}

			const { accessToken, name }: { accessToken: string; name: string } = await res.json()
			if (accessToken) {
				login(accessToken)
				setMessage('Login successful')
				navigate('/')
				sessionStorage.setItem('name', name)
			} else {
				setMessage('Access token not found')
			}
		} catch (error) {
			setMessage(error as string)
		} finally {
			setIsloading(false)
		}
	}

	const handleChangeLanguage = () => {
		setLanguage(language === 'en' ? 'pl' : 'en')
	}

	return (
		<div className='d-flex flex-column flex-1 flex-center'>
			<Card className={'w-300px'}>
				<div className='d-flex flex-column gap-2'>
					<div className='position-relative d-flex gap-2 align-center justify-center mb-2'>
						<h3>{mode === 'signIn' ? t('login') : t('sign_up')}</h3>
						<Button
							className='position-absolute absolute-right-centered rounded-full overflow-hidden border-2 border-light'
							variant='text'
							onlyIcon={true}
							onClick={handleChangeLanguage}>
							{language === 'en' ? <PL /> : <GB />}
						</Button>
					</div>
					<form className='d-flex flex-column gap-4' onSubmit={handleSubmit}>
						<input
							type='text'
							value={username}
							onChange={e => setUsername(e.target.value)}
							placeholder={t('username')}
							required
						/>
						<div className='d-flex position-relative'>
							<input
								className='flex-1 pr-4'
								type={`${showPassword ? 'text' : 'password'}`}
								value={password}
								onChange={e => setPassword(e.target.value)}
								placeholder={t('password')}
								required
							/>
							<Button
								variant='text'
								size='xs'
								type='button'
								className='position-absolute absolute-right-centered mr-2'
								onClick={() => setShowPassword(prevState => !prevState)}>
								{showPassword ? <Eye size={12} /> : <EyeOff size={12} />}
							</Button>
						</div>
						<Button isLoading={isLoading} type='submit'>
							{mode === 'signIn' ? t('sign_in') : t('sign_up')}
						</Button>
						<Button isLoading={isLoading} type='button' onClick={handleTestLogin}>
							{t('test_account')}
						</Button>
						{message && <div className='text-danger'>{message}</div>}
						{showLoadingMessage && (
							<div className='d-flex gap-1 text-danger'>
								<AlertTriangle size={16} className='flex-shrink-0' />
								<div>{t('backend_in_coldstart')}</div>
							</div>
						)}
						<div className='d-flex gap-2 align-center'>
							<span className='text-sm text-gray'>
								{mode === 'signIn' ? t('dont_have_account') : t('already_have_account')}
							</span>
							<Button
								type='button'
								variant='text'
								className='link text-hover-primary'
								onClick={() => setMode(prevMode => (prevMode === 'signIn' ? 'signUp' : 'signIn'))}>
								{mode === 'signIn' ? t('sign_up') : t('login')}
							</Button>
						</div>
					</form>
				</div>
			</Card>
		</div>
	)
}
