const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp')

// @des     Get reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
const getReviews = asyncHandler(async(req, res, next)=>{
  if (req.params.bootcampId) {
    const reviews = await Review.find({bootcamp: req.params.bootcampId})
    return res.json({
      success: true,
      count: reviews.length,
      data: reviews
    })
  } else {
    res.json(res.advancedResults)
  }
})

// @des     Get review
// @route   GET /api/v1/reviews/:id
// @access  Public
const getReview = asyncHandler(async(req, res, next)=>{
  const review = await Review.findById(req.params.id)
    .populate({path:'bootcamp', select:'name description'})

  if (!review){
    return next(new ErrorResponse(`No review found with id of ${req.params.id}`), 404)
  }

  res.json({
    success: true,
    data: review
  })
})

// @des     Post review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
const addReview = asyncHandler(async(req, res, next)=>{
  req.body.bootcamp = req.params.bootcampId
  req.body.user = req.user.id
  
  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  if (!bootcamp){
    return next(new ErrorResponse(`No bootcamp with the id ${req.params.bootcampId}`), 404)
  }

  const review = await Review.create(req.body)

  res.status(201).json({
    success: true,
    data: review
  })
})

// @des     Update review
// @route   PUT /api/v1/bootcamps/reviews/:id
// @access  Private
const updateReview = asyncHandler(async(req, res, next)=>{
  
  let review = await Review.findById(req.params.id)

  if (!review){
    return next(new ErrorResponse(`No review with the id ${req.params.id}`), 404)
  }

  // Make sure review belongs to user or admin
  if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`Not authorized to update review ${req.params.id}`), 401)
  }
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators:true
  })

  res.status(200).json({
    success: true,
    data: review
  })
})

// @des     Delete review
// @route   DELETE /api/v1/bootcamps/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async(req, res, next)=>{
  
  let review = await Review.findById(req.params.id)

  if (!review){
    return next(new ErrorResponse(`No review with the id ${req.params.id}`), 404)
  }

  // Make sure review belongs to user or admin
  if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(
      new ErrorResponse(`Not authorized to delete review ${req.params.id}`), 401)
  }
  
  await Review.findByIdAndDelete(req.params.id)

  res.status(200).json({
    success: true,
    data: {}
  })
})

module.exports = {getReviews, getReview, addReview, 
  updateReview, deleteReview}
