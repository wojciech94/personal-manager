import { useState } from 'react'
import { Eye, EyeOff } from 'react-feather'
import { useNavigate } from 'react-router-dom'
import { Card } from '../Card/Card'

export const Login = () => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [mode, setMode] = useState('signIn')
	const [message, setMessage] = useState('')

	const navigate = useNavigate()

	const handleSubmit = async e => {
		e.preventDefault()

		try {
			const baseUrl = 'http://localhost:5000/'
			const response = await fetch(`${baseUrl}${mode === 'signIn' ? 'login' : 'register'}`, {
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
			setMessage(error.message)
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
							<button
								type='button'
								className='btn btn-icon position-absolute absolute-right-centered'
								onClick={() => setShowPassword(prevState => !prevState)}>
								{showPassword ? <Eye size={12} /> : <EyeOff size={12} />}
							</button>
						</div>
						<button className='btn btn-primary' type='submit'>
							{mode === 'signIn' ? 'Login' : 'Sign up'}
						</button>
						<div className='d-flex gap-2 align-center'>
							<span className='text-sm text-gray'>
								{' '}
								{mode === 'signIn' ? `Don't have an account?` : `Already have an account?`}
							</span>

							<button
								type='button'
								className='btn btn-link link'
								onClick={() => setMode(prevMode => (prevMode === 'signIn' ? 'signUp' : 'signIn'))}>
								{mode === 'signIn' ? 'Sign Up' : 'Login'}
							</button>
						</div>
						{message && <div>{message}</div>}
					</form>
				</div>
			</Card>
		</div>
	)
}
