import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, {
  toJSON: {
    // Remove the password from the JSON representation of the document whenever it's converted
    transform: (doc, ret) => {
      delete ret.password // This line removes the password key from the object
      return ret // specifies what value is sent to the client post-transform
    }
  }
})



// We want to capture the "confirmPassword" passed in the `User.create` method
// We are defining a virtual field, which should have the exact same name as the missing field on the schema
// In this case, that's "confirmPassword"
// Until we set a value on this "virtual" field, it still won't appear on the "this" object
// We use the `.set()` method to do that
userSchema
  .virtual('confirmPassword')
  .set(function(passwordValue){
    this._confirmPassword = passwordValue
  })


//  Pre validation step to compare password
userSchema.pre('validate', function(next){
  // If the password is being modified (either on creation or on update)
  // Check if the passwords match. If they do not, invalidate the request.
  if (this.isModified('password') && this.password !== this._confirmPassword) {
    // Invalidate the request
    this.invalidate('confirmPassword', 'Please ensure both passwords match.')
  }
  // Run next() when this function is complete to move onto the next middleware
  next()
})


// We want to listen for the "save" event. This happens every time mongoose attempts to save a document to the database.
// When the event is triggered, we want to attach a callback function that executes just before the save happens.
userSchema.pre('save', function(next){
  // In this case, we'll use it to hash our password.
  // Inside of a declarative function, "this" refers to the user object
  // We first want to check if the password is being modified (either created for the first time or updated)
  if (this.isModified('password')){
    this.password = bcrypt.hashSync(this.password, 12)
  }

  // Once we're done, move on
  next()
})

const User = mongoose.model('User', userSchema)

export default User