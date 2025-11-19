import jwt from 'jsonwebtoken'
import User from '../models/user.js'

const isSignedIn = async (req, res, next) => {
  try {
    // Attempt to verify the token provided by the client
    const authHeader = req.headers.authorization
    // 1. Check if the user provided an Authorization header
    // 2. If they did not, we will send an error
    if (!authHeader) throw new Error('No auth header found')

    // 3. If they did, we want to remove "Bearer " from the beginning of the token to just access the raw token
    const token = authHeader.split(' ')[1]

    // 4. Verify that token is valid (expiry date has not passed and token was generated using our token secret)
    // jwt.verify will do this for us.
    const payload = jwt.verify(token, process.env.TOKEN_SECRET)

    // 5. Verify that the user contained within the token is still an active user (simply checking they exist in the db)
    const user = await User.findById(payload.user._id)

    // 6. If the user does not exist, throw an error
    if (!user) throw new Error('User not found in database')

    // 7. Modify the req object to make "user" available in the final route handler, much like we had with req.session.user
    req.user = user

    // 8. Pass to route handler if we get this far using next()
    next()
  } catch (error) {
    console.log(error.message)
    return res.status(401).json({ message: 'Unauthorised' })
  }
}

export default isSignedIn