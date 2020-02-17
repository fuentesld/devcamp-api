const path = require('path')
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

// @des     Get all bootcamps
// @route   GET /api/v1/bootcamps
// @access  Public
const getBootcamps = asyncHandler(async (req, res, next) =>{
  res.json(res.advancedResults)
})

// @des     Get sigle bootcamp
// @route   GET /api/v1/bootcamps/:id
// @access  Public
const getBootcamp = asyncHandler(async (req, res, next) =>{  

  const bootcamp = await Bootcamp.findById(req.params.id)
  if (!bootcamp){
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
  }
  res.json({
    success:true, 
    data: bootcamp
  })
})

// @des     Create new bootcamp
// @route   POST /api/v1/bootcamps
// @access  Private
const createBootcamp = asyncHandler(async (req, res, next) =>{
  // Add user to req.body
  req.body.user = req.user.id

  // check for published bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id})

  // If the user is not admin, they only cad add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(new ErrorResponse(`The user with Id ${req.params.id} has alredy published a bootcamp`, 400))
  }

  const bootcamp = await Bootcamp.create(req.body)
  res.status(201).json({
    success : true,
    data:bootcamp
  })     
})

// @des     Update bootcamp
// @route   PUT /api/v1/bootcamps/:id
// @access  Private
const updateBootcamp = asyncHandler(async (req, res, next) =>{
  
  let bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp){
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
  }

  // Make shure user is bootcamp owner
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.params.id} is not auhtorized to update this bootcamp`, 404))
  }

  bootcamp = await Bootcamp.findOneAndUpdate(req.params.id, 
    req.body, 
    {new:true, runValidators:true})

  res.json({
    success:true, 
    data: bootcamp
  })
})

// @des     Delete bootcamp
// @route   DELETE /api/v1/bootcamps/:id/photo
// @access  Private
const deleteBootcamp = asyncHandler(async(req, res, next) =>{

  const bootcamp = await Bootcamp.findById(req.params.id)
  if (!bootcamp){
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
  }
  // Make shure user is bootcamp owner
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.params.id} is not auhtorized to update this bootcamp`, 404))
  }

  bootcamp.remove()

  res.json({
    success:true,
    data: {}
  })
})


// @des     Get bootcamps with in a radius
// @route   get /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
const getBootcampInRadius = asyncHandler(async(req, res, next) =>{
  const {zipcode, distance} = req.params

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode)
  const lat = loc[0].latitude
  const lng = loc[0].longitude

  // Calc radius using radians
  // Divide distance by eadius of Earth
  // Earth raius = 3,963 mi / 6,378
  const radius = distance / 3963
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin :{ $centerSphere: [ [lng, lat], radius]}}
  })

  res.json({
    success:true, 
    count: bootcamps.length,
    data: bootcamps
  })
})

// @des     Upload photo
// @route   PUT /api/v1/bootcamps/:id/photo
// @access  Private
const bootcampPhotoUpload = asyncHandler(async(req, res, next) =>{
  const bootcamp = await Bootcamp.findById(req.params.id)

  if (!bootcamp){
    return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
  }

  // Make shure user is bootcamp owner
  if(bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin'){
    return next(new ErrorResponse(`User ${req.params.id} is not auhtorized to update this bootcamp`, 404))
  }  

  if(!req.files){
    return next(new ErrorResponse(`Please upload a file`, 404))
  }

  const file = req.files.file

  // Make shure the image is a photo
  if(!file.mimetype.startsWith('image')){
    return next(new ErrorResponse(`Please upload a image file`, 400))
  }

  // Check file size
  if(!file.size > process.env.MAX_FILE_UPLOAD ){
    return next(new ErrorResponse(`Please upload a image less than ${process.env.MAX_FILE_UPLOAD}`, 400))
  }

  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err =>{
    if(err) {
      console.error(err)
      return next(new ErrorResponse(`Problem with file upload`, 500))
    }
  })

  await Bootcamp.findByIdAndUpdate(req.params.id, {photo : file.name})

  res.json({
    success:true,
    data: file.name
  })
})


module.exports={getBootcamps, getBootcamp, createBootcamp, 
  updateBootcamp, deleteBootcamp, getBootcampInRadius, bootcampPhotoUpload}