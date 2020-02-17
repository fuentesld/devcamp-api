const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')


// @des     Gel all users
// @route   GET /api/v1/users
// @access  Private/admin
const getUsers = asyncHandler(async (req, res, next) =>{
  res.json(res.advancedResults)
})

// @des     Gel single users
// @route   GET /api/v1/users/:id
// @access  Private/admin
const getUser = asyncHandler(async (req, res, next) =>{
  const user = await User.findById(req.params.id)
  
  res.json({
    success: true,
    data: user
  })
})

// @des     create users
// @route   POST /api/v1/users
// @access  Private/admin
const createUser = asyncHandler(async (req, res, next) =>{
  const user = await User.create(req.body)
  
  res.status(201).json({
    success: true,
    data: user
  }) 
})

// @des     update user
// @route   PUT /api/v1/users/:id
// @access  Private/admin
const updateUser = asyncHandler(async (req, res, next) =>{
  const user = await User.findByIdAndUpdate(req.params.id, req.body,{
    new: true,
    runValidators: true
  })
  
  res.status(200).json({
    success: true,
    data: user
  }) 
})

// @des     delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/admin
const deleteUser = asyncHandler(async (req, res, next) =>{
  await User.findByIdAndDelete(req.params.id)
  
  res.status(200).json({
    success: true,
    data: {}
  }) 
})

module.exports = {getUsers, getUser, createUser, updateUser, deleteUser}