const mongoose = require('mongoose')

const mongoUrl = process.env.MONGODB_URI
const cld = `mongodb+srv://loredana:7ROaFPUT0qsWPf1a@cluster0.oa1cb03.mongodb.net/blogApp?retryWrites=true&w=majority`

console.log('connecting to', mongoUrl)

mongoose
    .connect(mongoUrl)
    .then((result) => {
        console.log('connected')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number
  })
  
  module.exports = mongoose.model('Blog', blogSchema)
