import { FormEvent, useState } from 'react'
import { Eye, EyeOff } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { API_URL } from '../../config'
import { Button } from '../Button/Button'
import { Card } from '../Card/Card'

export const Login = () => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [mode, setMode] = useState('signIn')
	const [message, setMessage] = useState('')
	const [isLoading, setIsloading] = useState(false)

	const navigate = useNavigate()

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setIsloading(true)

		try {
			const baseUrl = `${API_URL}`
			const response = await fetch(`${baseUrl}auth/${mode === 'signIn' ? 'login' : 'register'}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ name: username, password }),
			})

			if (!response.ok && mode === 'signIn') {
				throw new Error('Invalid credentials')
			} else if (!response.ok && mode === 'signUp') {
				throw new Error('Server error')
			}

			const data = await response.json()
			if (mode === 'signIn') {
				localStorage.setItem('token', data.token)
				setMessage('Login successful')
				navigate('/')
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
						{message && <div>{message}</div>}
					</form>
				</div>
			</Card>
		</div>
	)
}
