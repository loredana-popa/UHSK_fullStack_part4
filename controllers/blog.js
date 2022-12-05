const blogsRouter = require('express').Router()
const { default: mongoose } = require('mongoose')
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1} )
    response.json(blogs)
})

blogsRouter.post('/',  async (request, response) => {
    const body = request.body

    const user = await User.findOne({ id:'38a01919edbe77758e3aef5'})
    console.log('user is', user)
    
    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        user: user._id,
        likes: body.likes 
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
    
})

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }
    await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
    response.json(blog)
       
})

module.exports = blogsRouter