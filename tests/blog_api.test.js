const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')
const logger = require('../utils/logger')
const { response } = require('../app')

describe('when there are some blogs in the DB', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})

        const blogObjects = helper.initialBlogs
            .map(blog =>  new Blog(blog))

        const promiseAll = blogObjects.map(blog => blog.save())

        await Promise.all(promiseAll)

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

beforeAll( async () => {
    await User.deleteMany({})
    await Blog.deleteMany({})  
})

describe('addition of a new blog post', () => {

    test('POST blog successful if valid data', async () => {

        // create a newUser and save it in testDB
        const newUser = {
            username: 'testuser1',
            name: 'Test User',
            password: 'test'
        }

        await api
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send(newUser)
            .expect(201)

        //log in and get token
        const user = {
            username: 'testuser1',
            password: 'test'
        }

        const result = await api
            .post('/api/login')
            .send(user)

        let { accessToken } = result.body   

        const blogsAtStart = await helper.blogsInDb()
        // create a newBlog
        const newBlog = {
            title: 'Create a new blog',
            author: 'Loredana',
            url : 'http:/www.website.com',
            likes: 10
        }

        await api   
            .post('/api/blogs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        // check that nr of blogs in DB increases by one
        const blogsAtEnd = await helper.blogsInDb()
        logger.info('blogs in db are', blogsAtEnd)
        expect(blogsAtEnd).toHaveLength(blogsAtStart.length + 1)

        //check if the new blog was saved in DB
        const titles = blogsAtEnd.map((blog) => blog.title)
        expect(titles).toContain(newBlog.title)

    })

    test('POST blog sets likes to 0 as default value ,if missing', async () => {

        // create a newUser and save it in testDB
        const newUser = {
            username: 'testuser2',
            name: 'Test User2',
            password: 'test'
        }

        await api
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send(newUser)
            .expect(201)

        //log in and get token
        const user = {
            username: 'testuser2',
            password: 'test'
        }

        const result = await api
            .post('/api/login')
            .send(user)

        let { accessToken } = result.body   
        
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
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toEqual(
            expect.arrayContaining([
                expect.objectContaining(expectedBlog)]))
    })

    describe('POST blog fails with status 400 ', () => {
        
        test('fails if data invalid', async () => {
        // create a newUser and save it in testDB
            const newUser = {
                username: 'testuser3',
                name: 'Test User3',
                password: 'test'
            }

            await api
                .post('/api/users')
                .set('Content-Type', 'application/json')
                .send(newUser)
                .expect(201)

            //log in and get token
            const user = {
                username: 'testuser3',
                password: 'test'
            }

            const result = await api
                .post('/api/login')
                .send(user)

            let { accessToken } = result.body   

            const blogsAtStart = await helper.blogsInDb()

            const newBlog = {
                author: 'This blog POST will fail',
                likes: 1
            }
            
            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(newBlog)
                .expect(400)
    
            //check if the blog was saved in the DB
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(blogsAtStart.length) 

            //check if the blog title was saved in the DB
            const authors = blogsAtEnd.map(blog => blog.title)
            expect(authors).not.toContain('This blog POST will fail')
        })

        test('fails if token invalid', async () => {
            const accessToken = '12@test!token-invalid'

            const blogsAtStart = await helper.blogsInDb()

            const newBlog = {
                title: 'This blog POST will fail',
                author: 'Invalid Token',
                url : 'http:/www.website.com',
            }

            await api
                .post('/api/blogs')
                .set('Authorization', `Bearer ${accessToken}`)
                .send(newBlog)
                .expect(400)
    
            //check if the blog was saved in the DB
            const blogsAtEnd = await helper.blogsInDb()
            expect(blogsAtEnd).toHaveLength(blogsAtStart.length) 

            //check if the blog title was saved in the DB
            const titles = blogsAtEnd.map(blog => blog.title)
            expect(titles).not.toContain('This blog POST will fail')
        })
    })
}) 

describe('deletion of a blog', () => {

    test('succeeds with status code 204 if id is valid', async () => {
        //create new user and save in db
        const newUser = {
            username: 'testuser4',
            name: 'Test User 4',
            password: 'test'
        }

        await api
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send(newUser)
            .expect(201)

        // log in and get the acccessToken
        const user = {
            username: 'testuser4',
            password: 'test'
        }
    
        const result = await api
            .post('/api/login')
            .send(user)

        let { accessToken } = result.body 

        // insert a new blog in the DB
        const newBlog = {
            title: 'Delete a blog',
            author: 'Loredana P',
            url: 'http:/example.com',
        }

        await api   
            .post('/api/blogs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newBlog)
            .expect('Content-Type', /application\/json/)

        const blogsAtStart = await helper.blogsInDb()
        logger.info('blogsAtStart is', blogsAtStart)
        
        const blogToDelete = blogsAtStart[blogsAtStart.length - 1]
        logger.info('the blog to delete is', blogToDelete)
     
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(blogsAtStart.length - 1)

        const idArr = blogsAtEnd.map(r => r.id)
        expect(idArr).not.toContain(blogToDelete.id)
    })

})

describe('update a blog', () => {

    test('succeeds if data is valid', async () => {
        //create new user and save in db
        const newUser = {
            username: 'testuser5',
            name: 'Test User 5',
            password: 'test'
        }

        await api
            .post('/api/users')
            .set('Content-Type', 'application/json')
            .send(newUser)
            .expect(201)
            
        // log in and get the acccessToken
        const user = {
            username: 'testuser5',
            password: 'test'
        }
    
        const result = await api
            .post('/api/login')
            .send(user)

        let { accessToken } = result.body 

        // insert a new blog in the DB
        const newBlog = {
            title: 'How to update a blog',
            author: 'Loredana P',
            url: 'http://www.updateblog.com',
            likes: 5
        }

        await api   
            .post('/api/blogs')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        // Find newBlog in DB 
        const blogToUpdate = await Blog.findOne(newBlog)
        const blogToUpdateId = blogToUpdate.id
  
        await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send({ likes: 10 })
            .expect(200)

        const blogsAtEnd = await helper.blogsInDb()  
        console.log('blogs at end are', blogsAtEnd)  

        //  Make sure blog was updated 
        const updatedBlog = await Blog.findById(blogToUpdateId)
        expect(updatedBlog.likes).toBe(10)
    })
})

afterAll(() => {
    mongoose.connection.close()
})