const blogsRouter = require('express').Router()
const { default: mongoose } = require('mongoose')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require ('../utils/middleware')

const logger = require('../utils/logger')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({}).populate('user', { username: 1, name: 1} )
    response.json(blogs)
})


blogsRouter.post('/',  async (request, response) => {

    const body = request.body
    const token = middleware.tokenExtractor(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    // logger.info('decoded token is', decodedToken)

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)
    // logger.info('user is', user)

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
    })
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog) 
})

blogsRouter.delete('/:id', async (request, response) => {
    const token = middleware.tokenExtractor(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)

    const userid = middleware.userExtractor(request)

    if (!userid) {
        return response.status(401).json({ error: 'token missing or invalid' })
    } else if (blog.user.toString() !== userid.toString()) {
        return response.status(401).json({ error: 'this user can not perform the action ' })
    }

    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) => {
    const token = middleware.tokenExtractor(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const blogToUpdate = await Blog.findById(request.params.id)

    const userid = middleware.userExtractor(request)

    if (!userid) {
        return response.status(401).json({ error: 'token missing or invalid' })
    } else if (blogToUpdate.user.toString() !== userid.toString()) {
        return response.status(401).json({ error: 'this user can not perform the action ' })
    }


    const body = request.body

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }
    await Blog.findByIdAndUpdate(blogToUpdate, blog, { new: true })
    response.json(blog)
       
})

module.exports = blogsRouter