const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse')
const User = require('../models/User')

// protect routes
const protect = asyncHandler( async(req,res,next) => {
  let token

  if(req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')){

    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1]

  } 
  // else if (req.cookies.token) {

  //   // Set token from cookie
  //   token = req.cookies.token
  // }

  // Make shure token exist
  if(!token){
    return next(new ErrorResponse('Not authorized to acces this route', 401))
  } 

  try {
    // verify tokenv.JWT_
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id)
    next()
  } catch (err){
    return next(new ErrorResponse('Not authorized to acces this route', 401))
  }
  
})

// Grant access to especific roles
const authorize = (...roles)=>{
  return (req, res, next) =>{
    if(!roles.includes(req.user.role)){
      return next(new ErrorResponse(`User Role ${req.user.role} is no authorized to acces this route`, 403))
    }
    next()
  }
}


module.exports = {protect, authorize}