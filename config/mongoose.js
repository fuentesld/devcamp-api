const mongoose = require('mongoose')

const connectDB = async ()=>{
  const conn = await mongoose.connect(process.env.MONGO_URI,
    {useUnifiedTopology: true, useNewUrlParser:true, useCreateIndex:true, useFindAndModify:false})

  console.log(`MongoDB Connected : ${conn.connection.host}`.brightCyan.underline)
}
// useUnifiedTopology: true 
module.exports = connectDB