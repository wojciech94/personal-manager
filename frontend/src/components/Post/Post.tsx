import { useMemo, useState } from 'react'
import { Check, Edit, FileText, Heart, Trash2 } from 'react-feather'
import { useParams } from 'react-router-dom'
import { API_URL } from '../../config'
import { useApi } from '../../contexts/ApiContext'
import { getLocaleDateTime } from '../../utils/datetime'
import { Button } from '../Button/Button'
import { Comment, PostType } from './types'
import { useTranslation } from '../../contexts/TranslationContext'

export function Post({
	post,
	setLikes,
	onToggleEditPost,
	onDeletePost,
	onSavePost,
}: {
	post: PostType
	setLikes: (postId: string, like: boolean) => void
	onToggleEditPost: (val: string) => void
	onDeletePost: (val: string) => void
	onSavePost: (id: string, val: string) => void
}) {
	const [comments, setComments] = useState<Comment[]>(post.comments || [])
	const [showComments, setShowComments] = useState(false)
	const [commentValue, setCommentValue] = useState('')
	const [postInput, setPostInput] = useState(post.content)
	const [editedComments, setEditedComments] = useState<{ [key: string]: string }>({})
	const { fetchData } = useApi()
	const { dashboardId } = useParams()
	const userName = useMemo(() => sessionStorage.getItem('name'), [])
	const isAuthor = post.author.name === userName
	const { t } = useTranslation()

	const handleAddComment = async () => {
		const url = `${API_URL}dashboards/${dashboardId}/posts/${post._id}/comments`
		const options = {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ content: commentValue }),
		}

		const response = await fetchData<Comment>(url, options)

		if (response.error) {
			console.error('Failed to add comment:', response.status, response.error)
		}

		if (response.data) {
			const data = response.data
			setComments(prev => [{ ...data, isEdit: false }, ...prev])
		}

		setCommentValue('')
	}

	const handleRemoveComment = async (commentId: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/posts/${post._id}/comments`
		const options = {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id: commentId }),
		}

		const response = await fetchData<Comment>(url, options)

		if (response.error) {
			console.error('Failed to remove comment:', response.status, response.error)
			return
		}

		if (response.data) {
			setComments(prevC => prevC.filter(c => c._id !== commentId))
		}
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

	const handleSaveComment = async (id: string, like?: string) => {
		const url = `${API_URL}dashboards/${dashboardId}/comments`
		const options = {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ id: id, content: editedComments[id], like: like }),
		}

		const response = await fetchData<Comment>(url, options)

		if (editedComments[id] !== undefined || like) {
			if (response.error) {
				console.error('Failed to update comment:', response.status, response.error)
				return
			}

			if (response.data) {
				const data = response.data
				data.isEdit = false
				setComments(prev => prev.map(c => (c._id === id ? data : c)))
				const newEditedComments = { ...editedComments }
				delete newEditedComments[id]
				setEditedComments(newEditedComments)
			}
		} else {
			console.error('Id not found in editedComments object')
		}
	}

	if (!post) return null

	return (
		<div className='flex flex-col border-b border-slate-200 p-4 pb-0'>
			<div className='flex justify-between items-center gap-4'>
				<div className='flex items-center gap-2'>
					<span className={`font-semibold ${isAuthor ? 'text-blue-600' : ''}`}>{post.author.name}</span>
				</div>
				<div className='text-sm text-gray-500'>{getLocaleDateTime(post.updatedAt)}</div>
			</div>
			<div className='flex justify-between gap-4 py-4'>
				<>
					{post.isEdit ? (
						<textarea
							className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500'
							value={postInput}
							onChange={e => setPostInput(e.target.value)}></textarea>
					) : (
						<div className='flex-1'>{post.content}</div>
					)}
				</>

				{isAuthor && (
					<div className='flex gap-2'>
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
			<div className='flex items-center bg-slate-100 px-4 py-2 -mx-4 border-t border-slate-200'>
				<Button
					variant='text'
					className='!rounded-full hover:bg-purple-300 !p-1'
					onClick={() => setShowComments(prev => !prev)}>
					<FileText size={14} color='purple' />
				</Button>
				<span className='mr-4 px-1'>{comments.length}</span>
				<Button
					variant='text'
					className='!rounded-full hover:bg-rose-300 !p-1'
					onClick={() => setLikes(post._id, true)}>
					<Heart size={14} className='text-red-500' />
				</Button>
				<span className={`px-1 ${post.likes.includes(post.author._id) ? 'text-red-600' : ''}`}>
					{post.likes.length}
				</span>
			</div>
			<div
				className={`grid ${
					showComments ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
				} transition-all duration-300 -mx-4 px-4 bg-slate-100`}>
				<div className='overflow-hidden'>
					<div className='flex flex-col gap-1'>
						<div className='flex gap-2 pt-3 mb-2 border-t border-dashed border-slate-200'>
							<textarea
								value={commentValue}
								className='resize-y flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ml-[2px]'
								placeholder={t('type_your_comment')}
								onChange={e => setCommentValue(e.target.value)}></textarea>
							<Button className='self-end' variant='white' onClick={handleAddComment}>
								{t('send')}
							</Button>
						</div>
						{comments &&
							comments.length > 0 &&
							comments.map(c => (
								<div key={c._id} className='border-t border-dashed border-slate-200 py-3 flex flex-col gap-2'>
									<div className='flex gap-4 justify-between'>
										<span className='font-semibold text-blue-600'>{c.author.name}</span>
										<span className='text-sm text-gray-500'>{getLocaleDateTime(c.updatedAt)}</span>
									</div>
									<div className='flex gap-4 justify-between'>
										<>
											{!c.isEdit ? (
												<span>{c.content}</span>
											) : (
												<textarea
													className='flex-1 p-2 border text-gray-700 placeholder:text-gray-500 border-slate-300 rounded resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 ml-[2px]'
													value={editedComments[c._id]}
													onChange={e => handleUpdateComment(c._id, e.target.value)}></textarea>
											)}
										</>
										<div className='flex gap-2'>
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
		</div>
	)
}
