const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const bcrypt = require('bcrypt')
const User = require('../models/user')

describe('when there is initially one user in the DB', () => {
    beforeEach(async () => {
        await User.deleteMany({})
        // console.log('cleared')
    })

    test('users are returned as json', async () => {
        await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    }, 1000000)
    
    test('all users are returned', async () => {
        const response = await api.get('/api/users')

        const usersAtEnd = await helper.usersInDb()
        expect(response.body).toHaveLength(usersAtEnd.length)
    })

})


describe('creation of a new user', () => {

    test('succeeds with valid data', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'lpopa',
            name: 'Loredana Popa',
            password: 'thisisauserpassword',
        }
    
        await api   
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    })

})

afterAll(() => {
    mongoose.connection.close()
})