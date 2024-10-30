const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	note_categories: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'NoteCategory',
		},
	],
	created_at: {
		type: Date,
		default: Date.now(),
	},
})

userSchema.pre('save', async function (next) {
	if (this.isModified('password')) {
		const salt = await bcrypt.genSalt(10)
		this.password = await bcrypt.hash(this.password, salt)
	}
	next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
