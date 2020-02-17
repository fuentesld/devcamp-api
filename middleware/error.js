
const errorResponse = require('../utils/errorResponse')

const errorHandler = (err,req,res,next)=>{

  let error = {...err}
  error.message = err.message

  console.log(error.message)

  // Mongoose id error en parsing
  if (err.name === 'CastError'){
    const message = `Resource not found`
    error = new errorResponse(message, 404)
  }

  // Mongoose id dusplicado
  if (err.name === 'MongoError' && err.code === 11000){
    const message = `Duplicate field value`
    error = new errorResponse(message, 400)
  }

  // Mongoose errores de validacion
  if (err.name === 'ValidationError'){
    const message = Object.values(err.errors).map(val=>val.message)
    error = new errorResponse(message, 400)
  }

  res.status(error.statusCode || 500).json({
    succcess:false,
    error: error.message || 'Server Error' 
  })
}

module.exports=errorHandler