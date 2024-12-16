require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Dashboard = require('../models/Dashboard')
const Product = require('../models/Product')

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
		const result = await Product.updateMany(
			//{ tasksArchiveTime: { $exists: false } },
			//{ $set: { tasksArchiveTime: 24, tasksRemoveTime: 720 } }
			// { productsIds: { $exists: false } },
			// { $set: { productsIds: [] } }
			{ isFavourite: { $exists: false } },
			{ $set: { isFavourite: false } }
		)
		console.log('Documents updated:', result)
	} catch (error) {
		console.error('Error during migration:', error)
	} finally {
		mongoose.disconnect().then(() => console.log('Disconnected from the database.'))
	}
}
