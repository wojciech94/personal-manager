import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../config'
import { useApi } from '../contexts/ApiContext'
import { Button } from '../components/Button/Button'
import { Card, CardHeader } from '../components/Card/Card'
import { Post } from '../components/Post/Post'
import { PostType } from '../components/Post/types'
import { useTranslation } from '../contexts/TranslationContext'

export function Posts() {
	const [posts, setPosts] = useState<PostType[]>([])
	const [postInput, setPostInput] = useState('')
	const { dashboardId } = useParams()
	const { fetchData } = useApi()
	const userName = useMemo(() => sessionStorage.getItem('name'), [])
	const { t } = useTranslation()

	useEffect(() => {
		getPosts()
	}, [])

	const getPosts = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/posts`

		const response = await fetchData<PostType[]>(url)

		if (response.error) {
			console.error('Failed to fetch posts:', response.status, response.error)
			return
		}

		if (response.data) {
			const data: PostType[] = response.data
			setPosts(data)
		}
	}

	const setLikes = async (postId: string, like: boolean) => {
		const url = `${API_URL}dashboards/${dashboardId}/posts`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ postId: postId, like: like }),
		}

		const response = await fetchData<PostType>(url, options)

		if (response.error) {
			console.error('Failed to set likes:', response.status, response.error)
			return
		}

		if (response.data) {
			const data: PostType = response.data
			setPosts(prevPosts => prevPosts.map(p => (p._id === postId ? data : p)))
		}
	}

	const addPost = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/posts`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ content: postInput }),
		}

		const response = await fetchData<PostType>(url, options)

		if (response.error) {
			console.error('Failed to add post:', response.status, response.error)
			return
		}

		if (response.data) {
			const data = response.data
			setPosts(prev => [
				{
					...data,
					isEdit: false,
				},
				...prev,
			])
			setPostInput('')
		}
	}

	const onToggleEditPost = (id: string) => {
		setPosts(prev =>
			prev.map(p => {
				if (p._id === id) {
					p.isEdit = !p.isEdit
				}
				return p
			})
		)
	}

	const onDeletePost = async (id: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/posts`
		const options = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ postId: id }),
		}
		const response = await fetchData<PostType[]>(url, options)

		if (response.error) {
			console.error('Failed to delete post:', response.status, response.error)
			return
		}

		setPosts(prev => prev.filter(p => p._id !== id))
	}

	const onSavePost = async (id: string, content: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/posts`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ postId: id, content: content }),
		}

		const response = await fetchData<PostType>(url, options)

		if (response.error) {
			console.error('Failed to save post:', response.status, response.error)
			return
		}

		if (response.data) {
			const data = response.data
			setPosts(prev => prev.map(p => (p._id === id ? { ...data, isEdit: false } : p)))
		}
	}

	return (
		<Card
			className='overflow-hidden border rounded-lg shadow-sm'
			contentClass='!p-0'
			headerComponent={<CardHeader className='px-4 py-3 border-b' title={t('posts')}></CardHeader>}>
			<div className='flex p-4 border-b border-slate-200 gap-2'>
				<textarea
					value={postInput}
					className='flex-1 p-4 text-lg text-gray-800 placeholder-gray-600 bg-slate-100 rounded-lg resize-y min-h-[55px] focus:outline-none'
					placeholder={`${t('how_are_you_doing')} ${userName}?`}
					onChange={e => setPostInput(e.target.value)}></textarea>
				<Button className='self-end' variant='light' onClick={addPost}>
					{t('send')}
				</Button>
			</div>
			<div className='flex flex-col'>
				{posts.map(p => (
					<Post
						key={p._id}
						post={p}
						setLikes={setLikes}
						onToggleEditPost={onToggleEditPost}
						onDeletePost={onDeletePost}
						onSavePost={onSavePost}
					/>
				))}
			</div>
		</Card>
	)
}
