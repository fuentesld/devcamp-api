
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')


// @des     Get courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
const getCourses = asyncHandler(async(req, res, next)=>{
  if (req.params.bootcampId) {
    const courses = await Course.find({bootcamp: req.params.bootcampId})
    return res.json({
      success: true,
      count: courses.length,
      data: courses
    })
  } else {
    res.json(res.advancedResults)
  }
})

// @des     Get single course
// @route   GET /api/v1/courses/id
// @access  Public
const getCourse = asyncHandler(async(req, res, next)=>{
  const course = await Course.findById(req.params.id)
  .populate({path:'bootcamp', select: 'name description'})

  if(!course){
    return next(new ErrorResponse(`No Course with id of ${req.params.id}`), 404)
  }

  res.json({
    success:true,
    data:course
  })

})

// @des     Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
const addCourse = asyncHandler(async(req, res, next)=>{
  req.body.bootcamp = req.params.bootcampId 
  req.body.user = req.user.id
  

  const bootcamp = await Bootcamp.findById(req.params.bootcampId)

  if(!bootcamp){
    return next(new ErrorResponse(`No Bootcamp with id of ${req.params.bootcampId}`), 404)
  }

  // Make shure user is bootcamp owner
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.user.id} is not auhtorized to add a course to bootcamp ${bootcamp._id}`, 404))
  }  

  const course = await Course.create(req.body)


  res.json({
    success:true,
    data:course
  })

})

// @des     Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
const updateCourse = asyncHandler(async(req, res, next)=>{
  let course = await Course.findById(req.params.id)

  if(!course){
    return next(new ErrorResponse(`No Course with id of ${req.params.bootcampId}`), 404)
  }

  // Make shure user is course owner
  if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.user.id} is not auhtorized to update course ${course._id}`, 401))
  }  

  course = await Course.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    {new:true, runValidators:true}
  )

  res.json({
    success:true,
    data:course
  })

})


// @des     Delete course
// @route   Delete /api/v1/courses/:id
// @access  Private
const deleteCourse = asyncHandler(async(req, res, next)=>{
  const course = await Course.findById(req.params.id)

  if(!course){
    return next(new ErrorResponse(`No Course with id of ${req.params.id}`), 404)
  }

  // Make shure user is bootcamp owner
  if(course.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.user.id} is not auhtorized to delete course ${course._id}`, 404))
  }  

  await course.remove()

  res.json({
    success:true,
    data:{}
  })

})



module.exports = { getCourses, getCourse, addCourse, updateCourse, deleteCourse }