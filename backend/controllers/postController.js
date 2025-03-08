const Dashboard = require('../models/Dashboard')
const mongoose = require('mongoose')
const { addLog } = require('./logsController')
const Post = require('../models/Post')

exports.addPost = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { content } = req.body
		const userId = req.user.userId

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!content) {
			return res.status(400).json({ message: 'No content provided in the request body' })
		}

		const post = await Post.create({ content, author: userId })

		dashboard.postsIds = [post._id, ...dashboard.postsIds]
		await dashboard.save()

		await post.populate('author', 'name')

		const message = `Added new post (${post._id})`
		await addLog(dashboard.logsId, userId, message)

		res.status(201).json(post)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.getPosts = async (req, res) => {
	try {
		const { dashboardId } = req.params

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const posts = await Post.find({ _id: { $in: dashboard.postsIds } })
			.populate('author', 'name')
			.populate({
				path: 'comments',
				populate: {
					path: 'author',
					select: 'name',
				},
			})
			.sort({ createdAt: -1 })

		if (!posts) {
			return res.status(404).json({ message: `Posts not found in ${dashboard.name}` })
		}

		res.status(200).json(posts)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deletePost = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const userId = req.user.userId
		const { postId } = req.body

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const post = await Post.findByIdAndDelete(postId)

		dashboard.postsIds = dashboard.postsIds.filter(p => p._id !== postId)
		await dashboard.save()

		const message = `Delete post (${post._id})`
		await addLog(dashboard.logsId, userId, message)

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updatePost = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const userId = req.user.userId
		const { postId, content, like } = req.body

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		const post = await Post.findById(postId).populate('author', 'name')

		if (!post) {
			return res.status(404).json({ message: 'Post not found' })
		}

		if (content) post.content = content
		if (like) {
			if (post.likes.includes(userId)) {
				post.likes = post.likes.filter(l => l.toString() !== userId)
			} else {
				post.likes = [...post.likes, userId]
			}
		}
		// if (comment) post.comments = comment
		post.updatedAt = new Date()

		await post.save()

		const message = `Post updated (${post._id})`
		await addLog(dashboard.logsId, userId, message)

		res.status(200).json(post)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
