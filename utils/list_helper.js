const dummy = (blogs) => {
    return 1
}
  
const totalLikes = (blogs) => {
    const likesArr = blogs.map(blog => {
        return blog.likes
    })

    const reducer = (sum, item) =>{
        return sum + item
    }
    
    return likesArr.reduce(reducer, 0)
}

module.exports = {
    dummy,
    totalLikes
}