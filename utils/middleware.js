const jwt = require('jsonwebtoken')
const logger = require('./logger')


const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const tokenExtractor = (request, response, next) => {
    const authorization = request.get('authorization')
    // logger.info('authorization is', authorization)

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    } else if (!authorization) {
        return null 
    }
    
    next()
}

const userExtractor = (request, response, next) => {
    const token = tokenExtractor(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)

    return decodedToken.id
}




const errorHandler = (error, request, response, next) => {
    logger.error(error.message)
  
    if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'CastError') {
        return response.status(400).json({ error: 'malformed id' })
    } else if (error.name === 'JsonWebTokenError') {
        return response.status(400).json({ error: 'invalid token' })

    }
  
    next(error)
}
  
module.exports = {
    requestLogger,
    tokenExtractor,
    userExtractor,
    errorHandler
}