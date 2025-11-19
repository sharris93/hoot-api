import express from 'express'
import User from '../models/user.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { Unauthorised } from '../utils/errors.js'

const router = express.Router()

// * Routes
router.post('/sign-up', async (req, res, next) => {
  try {
    const user = await User.create(req.body)
    return res.status(201).json(user)
  } catch (error) {
    next(error)
  }
})

router.post('/sign-in', async (req, res, next) => {
  try {
    const { username, password } = req.body
    
    // Find user
    const userToLogin = await User.findOne({ username: username })

    if (!userToLogin) throw new Unauthorised('Unauthorised')
    
    // Compare the plain text password, with the hash
    // If they don't match:
    if (!bcrypt.compareSync(password, userToLogin.password)) {
      // Send an error
      throw new Unauthorised('Unauthorised')
    }

    // * Generate a web token to send to the client
    // Arguments:
    // 1. The payload argument - this is all the data (insensitive) that you want to store about the user inside the token. This is the middle string.
    // 2. The secret used to encrypt the third string in the token - this is what secures the token, and will be used to decrypt the token and allow access to the logged in user later
    // 3. Options object - accepts a few options, but we're using the `expiresIn` option to set an expiry timestamp on our token. We'll use this to prevent extended periods of token usage on our client side React apps.
    const token = jwt.sign(
      { user: { _id: userToLogin._id, username: userToLogin.username } },
      process.env.TOKEN_SECRET,
      { expiresIn: '2d' }
    )

    // * Send the token to the client
    return res.json({ token })
  } catch (error) {
    next(error)
  }
})

export default router