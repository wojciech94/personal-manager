const mongoose = require('mongoose')

const CommentSchema = mongoose.Schema({
	content: {
		type: String,
		required: true,
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
	comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: [] }],
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Comment', CommentSchema)
