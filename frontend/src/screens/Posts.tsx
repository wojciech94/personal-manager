import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { API_URL } from '../config'
import { useApi } from '../contexts/ApiContext'
import { Button } from '../components/Button/Button'
import { Card, CardHeader } from '../components/Card/Card'
import { Post } from '../components/Post/Post'
import { ApiError } from '../types/global'
import { PostType } from '../components/Post/types'

export function Posts() {
	const [posts, setPosts] = useState<PostType[]>([])
	const [postInput, setPostInput] = useState('')
	const userName = useMemo(() => sessionStorage.getItem('name'), [])
	const { dashboardId } = useParams()
	const { accessToken } = useApi()

	useEffect(() => {
		getPosts()
	}, [])

	const getPosts = async () => {
		if (!accessToken) {
			console.error('Access token not found')
		}
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/posts`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		})
		if (!res.ok) {
			const errorData: ApiError = await res.json()
			console.error(errorData.message)
			return
		}
		const data: PostType[] = await res.json()
		if (data) {
			console.log(data)
			setPosts(data)
		}
	}

	const setLikes = async (postId: string, like: boolean) => {
		if (!accessToken) {
			console.error('Access token not available')
			return
		}

		const res = await fetch(`${API_URL}dashboards/${dashboardId}/posts`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ postId: postId, like: like }),
		})

		if (!res.ok) {
			const errorData: ApiError = await res.json()
			console.error(errorData.message)
			return
		}

		const data = await res.json()
		if (data) {
			setPosts(prevPosts =>
				prevPosts.map(p => {
					return p._id === postId ? data : p
				})
			)
		}
	}

	// const setComments = ({
	// 	postId,
	// 	type,
	// 	comment,
	// 	data,
	// }: {
	// 	postId: string
	// 	type: string
	// 	comment?: Comment
	// 	data?: CommentDataType
	// }) => {
	// 	switch (type) {
	// 		case 'add':
	// 			if (comment) {
	// 				setPosts(prevPosts =>
	// 					prevPosts.map(p => {
	// 						if (p._id === postId) {
	// 							const newP: PostType = { ...p, comments: [comment, ...p.comments] }
	// 							return newP
	// 						}
	// 						return p
	// 					})
	// 				)
	// 			} else {
	// 				console.error('Comment is required for add type action')
	// 			}
	// 			break
	// 		case 'delete':
	// 			if (data && data.commentId) {
	// 				setPosts(prevPosts =>
	// 					prevPosts.map(p => {
	// 						if (p._id === postId) {
	// 							const newComments = p.comments.filter(c => c._id !== data.commentId)
	// 							const newP: PostType = { ...p, comments: newComments }
	// 							console.log(newP)
	// 							return newP
	// 						}
	// 						return p
	// 					})
	// 				)
	// 			} else {
	// 				console.error('Data is required for delete type action')
	// 			}
	// 			break
	// 	}
	// }

	const addPost = async (e: React.MouseEvent<HTMLButtonElement>) => {
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/posts`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ content: postInput }),
		})
		if (!res.ok) {
			const errorData: ApiError = await res.json()
			console.error(errorData.message)
			return
		}

		const data: PostType = await res.json()
		if (data) {
			const post: PostType = {
				...data,
				isEdit: false,
			}
			setPosts(prev => [post, ...prev])
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
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/posts`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ postId: id }),
		})

		if (!res.ok) {
			const errorData: ApiError = await res.json()
			console.error(errorData.message)
			return
		}

		setPosts(prev => prev.filter(p => p._id !== id))
	}

	const onSavePost = async (id: string, content: string) => {
		if (!accessToken) {
			console.error('Access token not available')
			return
		}

		const res = await fetch(`${API_URL}dashboards/${dashboardId}/posts`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ postId: id, content: content }),
		})
		if (!res.ok) {
			const errorData: ApiError = await res.json()
			console.error(errorData.message)
			return
		}
		const data: PostType = await res.json()
		if (data) {
			setPosts(prev => prev.map(p => (p._id === id ? { ...data, isEdit: false } : p)))
		}
	}

	return (
		<Card className='overflow-hidden' contentClass='p-0' headerComponent={<CardHeader title='Posts'></CardHeader>}>
			<div className='d-flex p-4 border-bottom border-light gap-2'>
				<textarea
					value={postInput}
					className='flex-1 p-4 border-none text-lg bg-lighter rounded-4 resize-vertical'
					style={{ minHeight: '55px' }}
					placeholder={`How are you doing ${userName}?`}
					onChange={e => setPostInput(e.target.value)}></textarea>
				<Button className='align-self-end' variant='light' onClick={e => addPost(e)}>
					Post
				</Button>
			</div>
			<div className='d-flex flex-column'>
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
