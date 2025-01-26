require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Dashboard = require('../models/Dashboard')
const Product = require('../models/Product')
const User = require('../models/User')
const Logs = require('../models/Logs')

const dbUrl = process.env.DB_URL

mongoose
	.connect(dbUrl)
	.then(() => {
		console.log('Connected to the database...')
		runMigration()
	})
	.catch(err => {
		console.error('Error connecting to the database:', err)
	})

async function runMigration() {
	try {
		const result = await User.updateMany({ notifications: { $exists: false } }, { $set: { notifications: [] } })

		console.log(`Migration completed successfully. Updated ${result.nModified} users.`)
	} catch (error) {
		console.error('Error during migration:', error)
	} finally {
		mongoose.disconnect().then(() => console.log('Disconnected from the database.'))
	}
}
