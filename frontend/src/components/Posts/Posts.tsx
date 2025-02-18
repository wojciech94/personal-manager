import { useState } from 'react'
import { Card, CardHeader } from '../Card/Card'
import { Post } from '../Post/Post'

export type PostType = {
	_id: string
	content: string
	author: string
	category: 'general' | 'info'
	likes: string[]
	createdAt: string
}

const postsData: PostType[] = [
	{
		_id: '1',
		content: 'Jak mija piąteczek? Jakie plany na dzisiaj?',
		author: 'Arturo',
		category: 'general',
		likes: [],
		createdAt: new Date().toString(),
	},
	{
		_id: '2',
		content:
			'Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum reprehenderit assumenda sequi sed minima beatae. Quasi unde aliquid impedit! Ipsum?',
		author: 'Zbi gniew',
		category: 'general',
		likes: ['Arturo'],
		createdAt: new Date().toString(),
	},
]

export function Posts() {
	const [posts, setPosts] = useState<PostType[]>(postsData)
	const header = <CardHeader title='Posts'></CardHeader>

	const setLikes = (id: string) => {
		setPosts(prevPosts =>
			prevPosts.map(p => {
				if (p._id === id) {
					const newP: PostType = { ...p, likes: Array.from(new Set([...p.likes, 'Arturo'])) }
					return newP
				}
				return p
			})
		)
	}

	return (
		<Card className='overflow-hidden' contentClass='p-0' headerComponent={header}>
			<div className='d-flex flex-column'>
				{posts.map((p, index) => (
					<Post key={index} post={p} setLikes={setLikes} />
				))}
			</div>
		</Card>
	)
}
