const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
	content: {
		type: String,
		required: true,
	},
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	category: {
		type: String,
		enum: ['general', 'info'],
		default: 'general',
	},
	likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Post', PostSchema)
