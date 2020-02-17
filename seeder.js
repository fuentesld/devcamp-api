const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv')

// load env vars
dotenv.config({path:'./config/config.env'})

// Load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')
const User = require('./models/User')
const Review = require('./models/Review')

// Connect to database
mongoose.connect(process.env.MONGO_URI,{
  useUnifiedTopology: true, 
  useNewUrlParser:true, 
  useCreateIndex:true, 
  useFindAndModify:false})

// read Json Files
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'))

// Import into DB
const importData = async ()=>{
  try {
    await User.create(users)
    await Bootcamp.create(bootcamps)
    await Course.create(courses)
    await Review.create(reviews)

    console.log("Data imported ...".green.inverse)
    process.exit()
  } catch (error) {
    console.error(error)
  }
}

// Delete data
const deleteData = async ()=>{
  try {
    await Review.deleteMany()
    await Course.deleteMany()
    await Bootcamp.deleteMany()
    await User.deleteMany()

    console.log("Data destroyed ...".red.inverse)
    process.exit()
  } catch (error) {
    console.error(err)
  }
}

if(process.argv[2] === "-i"){
  importData()
} else if(process.argv[2] === "-d"){
  deleteData()
} 

