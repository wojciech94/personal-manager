import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const Login = () => {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
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
				localStorage.setItem('token', data.token) // Zapisz token
				setMessage('Login successful')
				navigate('/') // Zmiana trasy po udanym logowaniu
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
		<div>
			<div className='d-flex gap-2 align-center justify-between w-300px'>
				<h3>{mode === 'signIn' ? 'Sign In' : 'Sign Up'}</h3>
				<button onClick={() => setMode(prevMode => (prevMode === 'signIn' ? 'signUp' : 'signIn'))}>
					{mode === 'signIn' ? 'Sign Up' : 'Sign In'}
				</button>
			</div>
			<form onSubmit={handleSubmit}>
				<input
					type='text'
					value={username}
					onChange={e => setUsername(e.target.value)}
					placeholder='Username'
					required
				/>
				<input
					type='password'
					value={password}
					onChange={e => setPassword(e.target.value)}
					placeholder='Password'
					required
				/>
				<button type='submit'>Login</button>
				{message && <div>{message}</div>}
			</form>
		</div>
	)
}
