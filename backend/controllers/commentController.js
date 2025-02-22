const mongoose = require('mongoose')
const Dashboard = require('../models/Dashboard')
const Post = require('../models/Post')
const Comment = require('../models/Comment')
const { addLog } = require('./logsController')

exports.addComment = async (req, res) => {
	try {
		const { dashboardId, postId } = req.params
		const { content } = req.body
		const userId = req.user.userId

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!postId) {
			return res.status(400).json({ message: 'No postId provided in the request params' })
		}

		if (!content) {
			return res.status(400).json({ message: 'No content provided in the request body' })
		}

		const post = await Post.findById(postId)

		if (!post) {
			return res.status(400).json({ message: 'Post not found in database' })
		}

		const comment = await Comment.create({ content, author: userId })

		await comment.populate('author', 'name')

		if (!comment) {
			return res.status(500).json({ message: 'Failed to create Comment' })
		}

		post.comments.unshift(comment._id)
		await post.save()

		const message = `Added new comment into Post (${post._id})`
		await addLog(dashboard.logsId, userId, message)

		res.status(201).json(comment)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.deleteComment = async (req, res) => {
	try {
		const { dashboardId, postId } = req.params
		const { id } = req.body
		const userId = req.user.userId

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!postId) {
			return res.status(400).json({ message: 'No postId provided in the request params' })
		}

		if (!id) {
			return res.status(400).json({ message: 'No id provided in the request body' })
		}

		const post = await Post.findById(postId)

		if (!post) {
			return res.status(400).json({ message: 'Post not found in database' })
		}

		const comment = await Comment.findByIdAndDelete(id)

		if (!comment) {
			return res.status(500).json({ message: 'Comment not found for provided id' })
		}

		post.comments = post.comments.filter(c => c._id.toString() !== id)
		await post.save()

		const message = `Delete comment in post (${post._id})`
		await addLog(dashboard.logsId, userId, message)

		res.status(204).send()
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}

exports.updateComment = async (req, res) => {
	try {
		const { dashboardId } = req.params
		const { id, content } = req.body
		const userId = req.user.userId

		if (!mongoose.Types.ObjectId.isValid(dashboardId)) {
			return res.status(400).json({ message: 'Invalid dashboard ID format' })
		}

		const dashboard = await Dashboard.findById(dashboardId)

		if (!dashboard) {
			return res.status(404).json({ message: 'Dashboard not found' })
		}

		if (!id) {
			return res.status(400).json({ message: 'No id provided in the request body' })
		}

		if (!content) {
			return res.status(400).json({ message: 'No content provided in the request body' })
		}

		const comment = await Comment.findById(id)

		if (!comment) {
			return res.status(500).json({ message: 'Comment not found' })
		}

		if (content) comment.content = content

		await comment.save()

		const message = `Update comment (${id})`
		await addLog(dashboard.logsId, userId, message)

		res.status(200).json(comment)
	} catch (error) {
		res.status(500).json({ message: error.message })
	}
}
