const crypto = require('crypto')
const ErrorResponse = require('../utils/ErrorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')
const sendEmail = require('../utils/sendEmail')

// @des     Register User
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) =>{
  const {name, email, password, role} = req.body

  // create user
  const user = await User.create({name, email, password, role})

  sendTokenResponse(user, 200, res)
  
})

// @des     Login User
// @route   POST /api/v1/auth/register
// @access  Public
const login = asyncHandler(async (req, res, next) =>{
  const { email, password } = req.body

  // Validate email & password
  if(!email || !password){
    return next( new ErrorResponse('Please provide a email & password',400))
  }

  // Check for user
  const user = await User.findOne({email}).select('+password');

  if(!user){
    return next( new ErrorResponse('Invalid credentials',401))
  }

  const isMatch = await user.matchPassword(password)
  if(!isMatch){
    return next( new ErrorResponse('Invalid credentials',401))
  }
  sendTokenResponse(user, 200, res)
  
})

// @des     Get current logged in user
// @route   GET /api/v1/auth/register
// @access  Private

const getMe = asyncHandler( async(req, res, next)=>{
  const user = await User.findById(req.user.id)

  res.json({
    success: true,
    data: user
  }
  )
})

// @des     Forgot Password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public

const forgotPassword = asyncHandler( async(req, res, next)=>{
  const user = await User.findOne({email: req.body.email})

  if(!user){
    return next( new ErrorResponse('Thers no user with that email',401))
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken()
  await user.save({validateBeforeSave: false})
  // Create reser url
  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

  const message = `You are recived this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password email reset',
      message
    })
    res.json({success:true, data:'Email sent'})
  } catch (error) {
    console.log(error)
    user.resetPaswordToken = undefined
    user.resetPasswordExpire = undefined
    await user.save({validateBeforeSave: false })
    return next( new ErrorResponse('Email could no be sent', 500))
  }
})

// @des     Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Private

const resetPassword = asyncHandler( async(req, res, next)=>{
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex')

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {$gt : Date.now()}
  })

  if(!user){
    return next( new ErrorResponse('Invalid Token', 400))
  }

  // Set the new password
  user.password = req.body.password
  user.resetPasswordToken = undefined
  user.resetPasswordExpire = undefined

  await user.save()
  sendTokenResponse(user, 200, res)
})

// @des     Update user datails
// @route   PUT /api/v1/auth/updatedetails
// @access  Private

const updateDetails = asyncHandler( async(req, res, next)=>{
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email
  }

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, 
    {new: true, runValidators: true})

  res.json({
    success: true,
    data: user
  }
  )
})

// @des     Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private

const updatePassword = asyncHandler( async(req, res, next)=>{
  const user = await User.findById(req.user.id).select('+password')

  // check current password
  if(!(await user.matchPassword(req.body.currentPassword))){
    return next( new ErrorResponse('Invalid Password', 401))
  }
  console.log(req.body.currentPassword ,req.body.newPassword)
  user.password = req.body.newPassword 
  await user.save()

  sendTokenResponse(user, 200, res)
})

// Get token from model, also create cookie and send response
const sendTokenResponse = (user, statusCode, res)=>{
  // Create TOKEN
  const token = user.getSignedJwtToken()
  
  const options = {
    expires: new Date(Date.now() + 
      process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly:true
  }
  
  if(process.env.NODE_ENV === 'production'){
    options.secure = true
  }

  res
  .status(statusCode)
  .cookie('token', token, options)
  .json({
    success: true,
        token
      })
  }

// @des     Log use out /clear cookie
// @route   GET /api/v1/auth/logout
// @access  Private

const logout = asyncHandler( async(req, res, next)=>{
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly:true
  } )

  res.json({
    success: true,
    data: {}
  }
  )
})


module.exports={register, login, getMe, forgotPassword, 
  resetPassword, updateDetails, updatePassword, logout}