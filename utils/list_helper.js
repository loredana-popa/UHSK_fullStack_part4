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

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}