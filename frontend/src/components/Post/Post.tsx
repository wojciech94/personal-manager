import { useMemo, useState } from 'react'
import { Check, Edit, FileText, Heart, Trash2 } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useAuth } from '../../contexts/AuthContext'
import { ApiError } from '../../main'
import { getLocaleDateTime } from '../../utils/helpers'
import { Button } from '../Button/Button'
import { PostType } from '../Posts/Posts'

export type Comment = {
	_id: string
	author: { _id: string; name: string }
	content: string
	updatedAt: string
	isEdit: boolean
}

export type CommentDataType = {
	commentId?: string
}

export function Post({
	post,
	setLikes,
	onToggleEditPost,
	onDeletePost,
	onSavePost,
}: {
	post: PostType
	setLikes: (postId: string, userId: string) => void
	onToggleEditPost: (val: string) => void
	onDeletePost: (val: string) => void
	onSavePost: (id: string, val: string) => void
}) {
	const [comments, setComments] = useState<Comment[]>(post.comments || [])
	const [showComments, setShowComments] = useState(false)
	const [commentValue, setCommentValue] = useState('')
	const [postInput, setPostInput] = useState(post.content)
	const [editedComments, setEditedComments] = useState<{ [key: string]: string }>({})
	const { accessToken } = useAuth()
	const { dashboardId } = useParams()
	const userName = useMemo(() => sessionStorage.getItem('name'), [])

	const handleAddComment = async () => {
		if (!accessToken) {
			console.error('Access token not available')
			return
		}
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/posts/${post._id}/comments`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ content: commentValue }),
		})

		if (!res.ok) {
			const errorData: ApiError = await res.json()
			console.error(errorData.message)
			return
		}

		const data: Comment = await res.json()
		if (data) {
			setComments(prev => [{ ...data, isEdit: false }, ...prev])
		}
		setCommentValue('')
	}

	const handleRemoveComment = async (commentId: string) => {
		if (!accessToken) {
			console.error('Access token not available')
			return
		}
		const res = await fetch(`${API_URL}dashboards/${dashboardId}/posts/${post._id}/comments`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${accessToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id: commentId }),
		})
		if (!res.ok) {
			const errorData: ApiError = await res.json()
			console.error(errorData.message)
			return
		}
		setComments(prevC => prevC.filter(c => c._id !== commentId))
	}

	const handleIsEditComment = (id: string) => {
		setComments(prev =>
			prev.map(c => {
				if (c._id === id) {
					const updatedComment = { ...c, isEdit: !c.isEdit }

					setEditedComments(prevEdited => {
						const newEditedComments = { ...prevEdited }
						if (updatedComment.isEdit) {
							newEditedComments[c._id] = c.content
						} else {
							delete newEditedComments[c._id]
						}
						return newEditedComments
					})

					return updatedComment
				}
				return c
			})
		)
	}

	const handleUpdateComment = (id: string, value: string) => {
		if (editedComments[id] !== undefined) {
			setEditedComments(prevC => ({ ...prevC, [id]: value }))
		} else {
			console.error('Id not found in editedComments object')
		}
	}

	const handleSaveComment = async (id: string) => {
		if (editedComments[id] !== undefined) {
			if (!accessToken) {
				console.error('Access token is not available')
				return
			}

			const res = await fetch(`${API_URL}dashboards/${dashboardId}/posts/${post._id}/comments`, {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ id: id, content: editedComments[id] }),
			})
			if (!res.ok) {
				const errorData: ApiError = await res.json()
				console.error(errorData.message)
				return
			}

			const data: Comment = await res.json()
			if (data) {
				data.isEdit = false
				setComments(prev => prev.map(c => (c._id === id ? data : c)))
			}
			const newEditedComments = { ...editedComments }
			delete newEditedComments[id]
			setEditedComments(newEditedComments)
		} else {
			console.error('Id not found in editedComments object')
		}
	}

	if (!post) return null

	return (
		<div className='d-flex flex-column border-bottom border-light px-4 pt-4'>
			<div className='d-flex justify-between align-center gap-4'>
				<div className='d-flex align-center gap-2'>
					<span className='text-bold'>{post.author.name}</span>
				</div>
				<div className='text-sm text-gray'>{getLocaleDateTime(post.updatedAt)}</div>
			</div>
			<div className='d-flex justify-between gap-4 py-4'>
				<>
					{post.isEdit ? (
						<textarea className='flex-1' value={postInput} onChange={e => setPostInput(e.target.value)}></textarea>
					) : (
						post.content
					)}
				</>
				<div>
					{post.author.name === userName && (
						<div className='d-flex gap-2'>
							{post.isEdit ? (
								<Button onlyIcon variant='success' onClick={() => onSavePost(post._id, postInput)}>
									<Check size={16} />
								</Button>
							) : (
								<Button onlyIcon variant='primary' onClick={() => onToggleEditPost(post._id)}>
									<Edit size={16} />
								</Button>
							)}

							<Button onlyIcon variant='danger' onClick={() => onDeletePost(post._id)}>
								<Trash2 size={16}></Trash2>
							</Button>
						</div>
					)}
				</div>
			</div>
			<div className='d-flex align-center align-center bg-lighter border-top border-light px-4 py-2 mx-n4'>
				<Button
					variant='text'
					className='rounded-full bg-hover-purple transition-colors size-24px'
					onClick={() => setShowComments(prev => !prev)}>
					<FileText size={14} color='purple' />
				</Button>
				<span className='mr-4 px-1'>{comments.length}</span>
				<Button
					variant='text'
					className='rounded-full bg-hover-danger transition-colors size-24px'
					onClick={() => setLikes(post._id, post.author._id)}>
					<Heart size={14} color='red' />
				</Button>
				<span className={`px-1 ${post.likes.includes(post.author._id) ? 'text-danger' : ''}`}>{post.likes.length}</span>
			</div>
			<div className={`grid-expander ${showComments ? 'grid-expanded' : ''} mx-n4 px-4 bg-lighter`}>
				<div className='d-flex flex-column gap-1'>
					<div className='d-flex gap-2 border-top-dashed border-top pt-3 border-light mb-2'>
						<textarea
							value={commentValue}
							className='resize-vertical flex-1'
							placeholder='Type your comment...'
							onChange={e => setCommentValue(e.target.value)}></textarea>
						<Button className='align-self-end' variant='light' onClick={handleAddComment}>
							Post
						</Button>
					</div>
					{comments &&
						comments.length > 0 &&
						comments.map(c => (
							<div key={c._id} className='border-top border-light border-top-dashed py-3 d-flex flex-column gap-2'>
								<div className='d-flex gap-4 justify-between'>
									<span className='text-bold text-primary'>{c.author.name}</span>
									<span className='text-sm text-gray'>{c.updatedAt}</span>
								</div>
								<div className='d-flex gap-4 justify-between'>
									<>
										{!c.isEdit ? (
											<span>{c.content}</span>
										) : (
											<textarea
												className='flex-1'
												value={editedComments[c._id]}
												onChange={e => handleUpdateComment(c._id, e.target.value)}></textarea>
										)}
									</>
									<div className='d-flex gap-2'>
										{c.isEdit ? (
											<Button size='sm' onlyIcon={true} variant='success' onClick={() => handleSaveComment(c._id)}>
												<Check size={14} />
											</Button>
										) : (
											<Button size='sm' onlyIcon={true} variant='primary' onClick={() => handleIsEditComment(c._id)}>
												<Edit size={14} />
											</Button>
										)}
										<Button size='sm' onlyIcon={true} variant='danger' onClick={() => handleRemoveComment(c._id)}>
											<Trash2 size={14} />
										</Button>
									</div>
								</div>
							</div>
						))}
				</div>
			</div>
		</div>
	)
}
