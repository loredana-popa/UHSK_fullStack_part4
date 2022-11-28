const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')

const initialBlogs = [
    {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        __v: 0
    },
    {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
    },
]

beforeEach(async () => {
    await Blog.deleteMany({})
    let blogObject = new Blog(initialBlogs[0])
    await blogObject.save()
    blogObject = new Blog(initialBlogs[1])
    await blogObject.save()
})

test('blogs are returned as json', async () => {
    await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
}, 1000000)

test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')
  
    expect(response.body).toHaveLength(initialBlogs.length)
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
    
        const response = await api.get('/api/blogs')
    
        expect(response.body).toHaveLength(initialBlogs.length + 1)
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
    
        const response = await api.get('/api/blogs')

        expect(response.body).toEqual(
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

        const response = await api.get('/api/blogs')

        expect(response.body).toHaveLength(initialBlogs.length)   
    })
}) 

afterAll(() => {
    mongoose.connection.close()
})