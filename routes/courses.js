const express = require('express')
const { getCourses, getCourse, addCourse, updateCourse,
  deleteCourse
} = require('../controllers/courses')

// advanced results
const Course = require('../models/Course');
const {protect, authorize} = require('../middleware/auth')

const router = express.Router({mergeParams : true})

const advancedResults = require('../middleware/advancedResults')
router.route('/')
  .get(
    advancedResults(Course, {path: 'bootcamp', select: 'name description'}), getCourses)
  .post(protect, authorize('admin', 'publisher'), addCourse)

router.route('/:id')
  .get(getCourse)
  .put(protect, authorize('admin', 'publisher'), updateCourse)
  .delete(protect, authorize('admin', 'publisher'), deleteCourse)

module.exports = router