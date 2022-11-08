class Review {
    body
    rating
    author
    comments
    likes
    dislikes

    constructor({ body, comments = [], likes = 0, dislikes = 0, author, rating }) {
        if (!body) throw new Error('missing review body')
        if (typeof author === 'undefined' ) throw new Error('missing review author')

        this.body = body
        this.comments = comments
        this.likes = likes
        this.dislikes = dislikes
        this.author = author
        this.rating = rating
    }
}

export { Review }