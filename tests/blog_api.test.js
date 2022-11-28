const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

beforeEach(async () => {
    await Blog.deleteMany({})
    console.log('cleared')

    helper.initialBlogs.forEach(async (blog) => {
        let blogObject = new Blog(blog)
        await blogObject.save()
        console.log('saved')
    })
    console.log('done')
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

test('the unique identifier property of the blog posts is named id', async () => {
    const response = await api.get('/api/blogs')

    const body = response.body
  
    expect(body).toBeDefined()
})

describe('create a new blog post', () => {
    test('a blog can be added', async () => {
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

    test('set likes to value 0,if missing', async () => {
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

    test('blog without title or url is not added', async () => {
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

afterAll(() => {
    mongoose.connection.close()
})