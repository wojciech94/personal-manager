import { FormEvent, useEffect, useState } from 'react'
import { AlertTriangle, Eye, EyeOff } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../config'
import { Button } from '../components/Button/Button'
import { Card } from '../components/Card/Card'
import { useApi } from '../contexts/ApiContext'
import { ApiError } from '../types/global'

export const Login = () => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [mode, setMode] = useState('signIn')
	const [message, setMessage] = useState('')
	const [isLoading, setIsloading] = useState(false)
	const [showLoadingMessage, setShowLoadingMessage] = useState(false)
	const { login } = useApi()
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

	return (
		<div className='d-flex flex-column flex-1 flex-center'>
			<Card className={'w-300px'}>
				<div className='d-flex flex-column gap-2'>
					<div className='d-flex gap-2 align-center justify-center'>
						<h3 className='mb-2'>{mode === 'signIn' ? 'Login' : 'Sign Up'}</h3>
					</div>
					<form className='d-flex flex-column gap-4' onSubmit={handleSubmit}>
						<input
							type='text'
							value={username}
							onChange={e => setUsername(e.target.value)}
							placeholder='Username'
							required
						/>
						<div className='d-flex position-relative'>
							<input
								className='flex-1 pr-4'
								type={`${showPassword ? 'text' : 'password'}`}
								value={password}
								onChange={e => setPassword(e.target.value)}
								placeholder='Password'
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
							{mode === 'signIn' ? 'Login' : 'Sign up'}
						</Button>
						<Button isLoading={isLoading} type='button' onClick={handleTestLogin}>
							Test account
						</Button>
						{message && <div className='text-danger'>{message}</div>}
						{showLoadingMessage && (
							<div className='d-flex gap-1 text-danger'>
								<AlertTriangle size={16} className='flex-shrink-0' />
								<div>
									Backend is in cold start mode due to server inactivity. This might take a little longer than usual...
								</div>
							</div>
						)}
						<div className='d-flex gap-2 align-center'>
							<span className='text-sm text-gray'>
								{mode === 'signIn' ? `Don't have an account?` : `Already have an account?`}
							</span>
							<Button
								variant='text'
								className='link text-hover-primary'
								onClick={() => setMode(prevMode => (prevMode === 'signIn' ? 'signUp' : 'signIn'))}>
								{mode === 'signIn' ? 'Sign Up' : 'Login'}
							</Button>
						</div>
					</form>
				</div>
			</Card>
		</div>
	)
}
