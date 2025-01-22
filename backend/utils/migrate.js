require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const Dashboard = require('../models/Dashboard')
const Product = require('../models/Product')
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
		const dashboards = await Dashboard.find({ logsId: { $exists: false } })
		console.log(`Found ${dashboards.length} dashboards to update.`)

		for (const dashboard of dashboards) {
			// Utwórz nowy obiekt Logs
			const newLogs = new Logs({ logs: [] })
			await newLogs.save()

			// Przypisz referencję do dashboarda
			dashboard.logsId = newLogs._id
			await dashboard.save()

			console.log(`Updated dashboard ${dashboard._id} with logsId ${newLogs._id}`)
		}

		console.log('Migration completed successfully.')
	} catch (error) {
		console.error('Error during migration:', error)
	} finally {
		mongoose.disconnect().then(() => console.log('Disconnected from the database.'))
	}
}
