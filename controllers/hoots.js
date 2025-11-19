import express from 'express'
import Hoot from '../models/hoot.js'
import isSignedIn from '../middleware/isSignedIn.js'

import { NotFound, Forbidden } from '../utils/errors.js'

const router = express.Router()

// * Routes
// All urls are prefixed with: /hoots

// * Create
router.post('', isSignedIn, async (req, res, next) => {
  try {
    // Modify the request body to include the logged in user as the author
    req.body.author = req.user._id
    // Create the hoot
    const hoot = await Hoot.create(req.body)
    // Return the new hoot object to the client
    res.status(201).json(hoot)
  } catch (error) {
    next(error)
  }
})

// * Index
router.get('', async (req, res, next) => {
  try {
    const hoots = await Hoot.find().populate('author')
    res.json(hoots)
  } catch (error) {
    next(error)
  }
})

// * Show
router.get('/:hootId',  async (req, res, next) => {
  try {
    const { hootId } = req.params
    const hoot = await Hoot.findById(hootId).populate(['author', 'comments.author'])

    if (!hoot) throw new NotFound('Hoot not found.')

    res.json(hoot)
  } catch (error) {
    next(error)
  }
})

// * Update
router.put('/:hootId', isSignedIn, async (req, res, next) => {
  try {
    const { hootId } = req.params
    const hoot = await Hoot.findById(hootId)
    if (!hoot) throw new NotFound('Hoot not found.')

    // If we find the hoot, we want to check the logged in user is authorised to update it
    if(!hoot.author.equals(req.user._id)) {
      throw new Forbidden('You do not have permission to access this resource.')
    }

    const updatedHoot = await Hoot.findByIdAndUpdate(hootId, req.body, { returnDocument: 'after' })

    res.json(updatedHoot)
  } catch (error) {
    next(error)
  }
})

// * Delete
router.delete('/:hootId', isSignedIn, async (req, res, next) => {
  try {
    const { hootId } = req.params
    const hoot = await Hoot.findById(hootId)
    if (!hoot) throw new NotFound('Hoot not found.')

    // If we find the hoot, we want to check the logged in user is authorised to update it
    if(!hoot.author.equals(req.user._id)) {
      throw new Forbidden('You do not have permission to access this resource.')
    }

    await Hoot.findByIdAndDelete(hootId)

    res.sendStatus(204)
  } catch (error) {
    next(error)
  }
})

// * Create Comment
router.post('/:hootId/comments', isSignedIn, async (req, res, next) => {
  try {
    const { hootId } = req.params
    const hoot = await Hoot.findById(hootId)
    if (!hoot) throw new NotFound('Hoot not found.')

    // Add the logged in user as the comment author
    req.body.author = req.user._id

    // Adds the new comment to the comments array 
    hoot.comments.push(req.body)

    await hoot.save()

    res.status(201).json({ message: 'HIT CREATE COMMENT ROUTE' })
  } catch (error) {
    next(error)
  }
})

export default router