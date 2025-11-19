const errorLogger = (error) => {
  console.log('')
  console.log('🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨🚨')
  console.log('-------------------')
  console.log('Name:', error.name || 'Error')
  console.log('-------------------')
  console.log('Message:', error.message)
  console.log('-------------------')
  console.log('Stack:')
  console.log(error.stack)
  console.log('-------------------')
  console.log('This error occurred on the following request:')
}


const errorHandler = (error, req, res, next) => {
  // Log all errors
  // errorLogger(error)
  console.log(error)

  // Define an error response object we can append new error keys to
  const errorResponse = {}

  // Unique constraint
  if (error.code === 11000) {
    const errors = Object.entries(error.keyValue)
    errors.forEach(error => {
      const [fieldName, value] = error
      errorResponse[fieldName] = `${fieldName} "${value}" already taken. Please choose another.`
    })
    return res.status(400).json(errorResponse)
  }

  // CastError
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(404).json({ message: 'Not found.'})
  }
  
  // ValidationError
  if (error.name === 'ValidationError') {
    // Get the error objects as an array (rather than keys on an object)
    const errorObjects = Object.values(error.errors)

    console.log(errorObjects)

    // Iterate the error object array, setting the path as a key and the message as a value on the error response object
    errorObjects.forEach(error => {
      errorResponse[error?.properties?.path || error.path || 'fieldError'] = error?.properties?.message || error.message || 'Something went wrong'
    })

    // Finally, return the error
    return res.status(400).json(errorResponse)
  }

  // Continue to handle errors
  return res.status(error.status || 500).json({ message: error.message || 'Something went wrong. Please try again later.' })
}

export default errorHandler