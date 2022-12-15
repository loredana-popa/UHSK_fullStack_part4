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
        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })
    
        await user.save()
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
            username: 'mluukai',
            name: 'Matti Lukkainen',
            password: 'password4',
        }
    
        await api   
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)
    
        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)

    })
    describe('fails with invalid data', () => {

        test('if username already exists in DB', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'mluukai',
                name: 'Matti Lukkainen',
                password: 'password2',
            }
    
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            
            expect(result.body.error).toContain('username must be unique')

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)

        })

        test('if password length less than 3 characters', async () => {
            const usersAtStart = await helper.usersInDb()

            const newUser = {
                username: 'hellas',
                name: 'Arto Hellas',
                password: 'pa'
            }
    
            const result = await api
                .post('/api/users')
                .send(newUser)
                .expect(400)
                .expect('Content-Type', /application\/json/)
            
            expect(result.body.error).toContain('password must be at least 3 characters long')

            const usersAtEnd = await helper.usersInDb()
            expect(usersAtEnd).toHaveLength(usersAtStart.length)
        })
    })
 

})

afterAll(() => {
    mongoose.connection.close()
})