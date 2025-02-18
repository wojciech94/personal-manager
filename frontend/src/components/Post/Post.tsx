import { useMemo, useState } from 'react'
import { Check, Edit, FileText, Heart, Trash2 } from 'react-feather'
import { getLocaleDateTime } from '../../utils/helpers'
import { Button } from '../Button/Button'
import { PostType } from '../Posts/Posts'

type Comment = {
	_id: string
	author: string
	content: string
	createdAt: string
	isEdit: boolean
}

type EditedComment = {
	_id: string
	content: string
}

export function Post({ post, setLikes }: { post: PostType; setLikes: React.Dispatch<string> }) {
	const [showComments, setShowComments] = useState(false)
	const [addCommentValue, setAddCommentValue] = useState('')
	const [comments, setComments] = useState<Comment[]>([])
	const [editedComments, setEditedComments] = useState<{ [key: string]: string }>({})
	const userName = useMemo(() => sessionStorage.getItem('name'), [])

	const handleAddComment = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey && userName) {
			const text = e.currentTarget.value.trim()
			const comment: Comment = {
				_id: crypto.randomUUID(),
				author: userName,
				content: text,
				createdAt: getLocaleDateTime(new Date().toString()),
				isEdit: false,
			}
			e.preventDefault()
			setComments(prev => [...prev, comment])
			setAddCommentValue('')
		}
	}

	const handleRemoveComment = (id: string) => {
		setComments(prev => prev.filter(c => c._id !== id))
	}

	const handleIsEditComment = (id: string) => {
		setComments(prev =>
			prev.map(c => {
				if (c._id === id) {
					c.isEdit = !c.isEdit
					if (c.isEdit) {
						setEditedComments(prevE => ({
							...prevE,
							[c._id]: c.content,
						}))
					} else {
						const newEditedComments = { ...editedComments }
						delete newEditedComments[c._id]
						setEditedComments(newEditedComments)
					}
				}
				return c
			})
		)
	}

	const handleEditComment = (id: string, value: string) => {
		if (editedComments[id] !== undefined) {
			setEditedComments(prevC => ({ ...prevC, [id]: value }))
		}
	}

	const handleSaveComment = (id: string) => {
		if (editedComments[id] !== undefined) {
			setComments(prev =>
				prev.map(c => {
					if (c._id === id) {
						c.isEdit = false
						c.content = editedComments[id]
					}
					return c
				})
			)
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
					<span className='text-bold'>{post.author}</span>
					<span className='badge'>{post.category}</span>
				</div>
				<div className='text-sm text-gray'>{getLocaleDateTime(post.createdAt)}</div>
			</div>
			<div className='py-4'>{post.content}</div>
			<div className='d-flex align-center gap-4 align-center bg-lighter border-top border-light px-4 py-2 mx-n4'>
				<Button variant='text' onClick={() => setShowComments(prev => !prev)}>
					<FileText size={14} color='purple' />
				</Button>
				<Button variant='text' onClick={() => setLikes(post._id)}>
					<Heart size={14} color='red' />
					{post.likes.length}
				</Button>
			</div>
			<div className={`grid-expander ${showComments ? 'grid-expanded' : ''} mx-n4 px-4 bg-lighter`}>
				<div className='d-flex flex-column gap-1'>
					<div className='d-flex gap-2 border-top-dashed border-top pt-3 border-light mb-2'>
						<textarea
							className='flex-1'
							value={addCommentValue}
							placeholder='Enter your comment...'
							onKeyDown={e => handleAddComment(e)}
							onChange={e => setAddCommentValue(e.target.value)}></textarea>
					</div>
					{comments &&
						comments.length > 0 &&
						comments.map((c, index) => (
							<div key={index} className='border-top border-light border-top-dashed py-2 d-flex flex-column gap-1'>
								<div className='d-flex gap-4 justify-between'>
									<span className='text-bold text-primary'>{c.author}</span>
									<span className='text-sm text-gray'>{c.createdAt}</span>
								</div>
								<div className='d-flex gap-4 justify-between'>
									<>
										{!c.isEdit ? (
											<span>{c.content}</span>
										) : (
											<textarea
												className='flex-1'
												value={editedComments[c._id]}
												onChange={e => handleEditComment(c._id, e.target.value)}></textarea>
										)}
									</>
									<div className='d-flex gap-1'>
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
