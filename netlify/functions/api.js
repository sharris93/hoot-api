import express from 'express'
import mongoose from 'mongoose'
import 'dotenv/config'

// Middleware
import cors from 'cors'
import morgan from 'morgan'
import errorHandler from '../../middleware/errorHandler.js'

// * Routers
import authRouter from '../../controllers/auth.js'
import hootRouter from '../../controllers/hoots.js'

const app = express()

// * Middleware
app.use(cors())
app.use(morgan('dev'))
// app.use(express.urlencoded()) // If the Content-Type header is urlencoded, then parse this data and add it to req.body
// This API will send JSON responses and expects JSON bodies on requests it receives.
// Therefore, instead of express.urlencoded() to parse incoming form submissions, we'll parse JSON bodies from fetch requests


// * Routes
app.use('/auth', authRouter)
app.use('/hoots', hootRouter)

// * Error handling middleware
// Always defined with 4 arguments
app.use(errorHandler)

// * Connections
const connect = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('🔒 Database connection established')
  } catch (error) {
    console.log(error)
  }
}
connect()

// Start Node Server
export const handler = serverless(app, {
  request: (req, event) => {
    if (typeof event.body === 'string') {
      try {
        req.body = JSON.parse(event.body);
      } catch (err) {
        req.body = {};
      }
    }
  }
});