const express = require('express')
const { getBootcamps, getBootcamp, createBootcamp, updateBootcamp, 
        deleteBootcamp, getBootcampInRadius, bootcampPhotoUpload
} = require('../controllers/bootcamps')

// advanced results
const Bootcamp = require('../models/Bootcamp');

// Include other resources routers
const courseRouter = require('./courses')
const reviewRouter = require('./reviews')

const router = express.Router()

const {protect, authorize} = require('../middleware/auth')

const advancedResults = require('../middleware/advancedResults')
// Re-route into other resource router
router.use('/:bootcampId/courses', courseRouter)
router.use('/:bootcampId/reviews', reviewRouter)

router.route('/')
  .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
  .post(protect, authorize('admin', 'publisher'), createBootcamp)

router.route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('admin', 'publisher'), updateBootcamp)
  .delete(protect, authorize('admin', 'publisher'), deleteBootcamp)

router.route('/radius/:zipcode/:distance')
  .get(getBootcampInRadius)

router.route('/:id/photo')
  .put(protect, authorize('admin', 'publisher'), bootcampPhotoUpload)

module.exports = router