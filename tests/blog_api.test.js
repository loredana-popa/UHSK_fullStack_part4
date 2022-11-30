const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

describe('when there are some blogs in the DB', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        // console.log('cleared')

        const blogObjects = helper.initialBlogs
            .map(blog =>  new Blog(blog))

        const promiseAll = blogObjects.map(blog => blog.save())
        // console.log('saved')

        await Promise.all(promiseAll)
        // console.log('done')
    })

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    }, 1000000)
    
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
      
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })
    
    // NOTE!! test to be revised task 4.9*: Blog list tests, step2
    test('the unique identifier property of the blog posts is named id', async () => {
        console.log('test to be revised')
        const response = await api.get('/api/blogs')
    
        const body = response.body
      
        expect(body).toBeDefined()
    })
})


describe('addition of a new blog post', () => {

    test('succeeds with valid data', async () => {
        const newBlog = {
            title: 'Create a new blog',
            author: 'Loredana',
            url : 'http:/www.website.com',
            likes: 0,
        }
    
        await api   
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const blogsAtEnd = await helper.blogsInDb()
    
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    })

    test('sets likes to 0 as default value ,if missing', async () => {
        const newBlog = {
            title: ' If the likes property is missing from the request, it will default to the value 0.',
            author: 'Loredana',
            url : 'http:/www.website.com',
        }

        const expectedBlog = {
            title: ' If the likes property is missing from the request, it will default to the value 0.',
            author: 'Loredana',
            url : 'http:/www.website.com',
            likes: 0,
        }
        
        await api   
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toEqual(
            expect.arrayContaining([
                expect.objectContaining(expectedBlog)]))
    })

    test('fails with status 400 if data invalid', async () => {
        const newBlog = {
            author: 'Loredana',
            likes: 1
        }
        
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)   
    })
}) 

describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToDelete = blogsAtStart[0]
     
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)

        const idArr = blogsAtEnd.map(r => r.id)
        expect(idArr).not.toContain(blogToDelete.id)
    })
})

describe('update a blog', () => {
    test('succeeds if data is valid', async () => {
        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        const expectedBlog = {...blogToUpdate, likes : 1111111111111111}
  
        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(expectedBlog)
            .expect(200)

        const blogsAtEnd = await helper.blogsInDb()  
        console.log('blogs at end are', blogsAtEnd)  

        expect(blogsAtEnd).toEqual(
            expect.arrayContaining([
                expect.objectContaining(expectedBlog)]))
        
    })
})

afterAll(() => {
    mongoose.connection.close()
})