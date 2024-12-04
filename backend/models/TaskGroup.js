const mongoose = require('mongoose')

const taskGroupSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	tasks: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Task',
		},
	],
})

const TaskGroup = mongoose.model('TaskGroup', taskGroupSchema)

module.exports = TaskGroup
