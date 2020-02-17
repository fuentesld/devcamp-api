const express = require('express')
const { getUsers, getUser, updateUser, createUser,deleteUser
} = require('../controllers/users')

// advanced results
const User = require('../models/User');

const router = express.Router({mergeParams : true})

const advancedResults = require('../middleware/advancedResults')
const {protect, authorize} = require('../middleware/auth')

router.use(protect)
router.use(authorize('admin'))

router.route('/')
  .get(advancedResults(User), getUsers)
  .post(createUser)

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser)

module.exports = router