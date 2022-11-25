var _ = require('lodash')

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const likesArr =  blogs.map(blog => blog.likes)
    const reducer = (sum, item) =>{
        return sum + item
    }

    return likesArr.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const likesArr =  blogs.map(blog => blog.likes)
    const maxLikes = Math.max(...likesArr)
   
    return blogs.length === 0
        ? 'there are no saved blogs'
        : blogs.find(blog => blog.likes === maxLikes)
}

const mostBlogs = (blogs) => {
    const nrOfBlogsByAuth = _.map(_.countBy(blogs, 'author'), (val, key) => ({author: key, blogs: val}))
    
    return blogs.length === 0
        ? 'there are no saved blogs'
        : _.maxBy(nrOfBlogsByAuth, 'blogs')
}


const mostLikes = (blogs) => {
    return 'there are no saved blogs'
    
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes

}