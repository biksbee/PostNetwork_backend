import {db} from "../db.js";

export const createPost = async (req, res) => {
    try{
        const {title, content, tags} = req.body
        const now = new Date();
        const newPost = await db.query(`INSERT INTO post (title, content, date_change, tags, user_id) values ($1, $2, $3, $4, $5) RETURNING *`, [title, content, now, tags, req.userId])
        res.json(newPost.rows[0])
    } catch (err){
        console.log(err)
        res.statusCode.json({
            message: "Failed to create post!"
        })
    }

}
export const getPostAll = async (req, res) => {
    const user_id = req.headers.auth_user_id
    const { counter, page } = req.body
    const posts = await db.query(`
                                    SELECT post.id, title, content, date_change, user_id, tags, nick, email, 
                                        exists(SELECT * from favoritepost where post_id = post.id and user_id = $3) isFavorite
                                        FROM post
                                        join person on post.user_id = person.id
                                        order by date_change desc
                                        limit $1 offset $1*($2 - 1)
                                    `, [counter, page, user_id])
    // если user_id есть в favoritePost тогда для поста с нужным id добавить поле с тем что у пользователя он в избранном
    const len = await db.query(`select count(*) from post`)
    const postsS = posts.rows
    const quan = len.rows[0].count
    res.json({
        quan,
        postsS
    })
}
export const getPostByUser = async (req, res) => {
    try {
        const { nick, counter, page } = req.body
        const user_id = req.headers.auth_user_id
        const posts = await db.query(`
                                        select post.id, title, content, date_change, user_id, tags,
                                        exists(SELECT * from favoritepost where post_id = post.id and user_id = $4) isFavorite, nick
                                        from post 
                                        join person on post.user_id = person.id and nick = $1
                                        order by date_change desc 
                                        limit $2 offset $2*($3 - 1)
                                        `, [nick, counter, page, user_id])
        const postsS = posts.rows
        const len = await db.query(`select count(*) from post where user_id = (select id from person where nick = $1)`, [nick])
        const quan = len.rows[0].count
        const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
        if(token) {
            try {
                const user = await db.query(`select email from person where nick = $1`, [nick])
                const { email } = user.rows[0]
                res.json({
                    postsS,
                    nick,
                    quan,
                    email
                })
            } catch (err) {
                console.log(err)
                res.statusCode.json({
                    message: "Failed to view posts!"
                })
            }
        } else {
            const length = posts.rows.length
            res.json({
                length,
                quan,
                nick,
            })
        }
    } catch (err){
        console.log(err)
        res.statusCode.json({
            message: "Failed to get post!"
        })
    }
}
export const getPostByTitle = async (req, res) => {
    const { title } = req.query;
    const titles = await db.query(`select post.*, person.nick from post join person on post.user_id = person.id where title LIKE $1 || '%'`, [title])
    const postList = titles.rows
    res.json({
        postList
    })
}

export const getPostById = async (req, res) => {
    try{
        const id = req.query.post_id
        const nick = req.query.nick
        const postFormDb = await db.query(`select * from post where id = $1`, [id])
        const post = postFormDb.rows[0]
        const tokenKey = (req.headers.authorization || '').replace(/Bearer\s?/, '');
        if (tokenKey) {
            try {
                const creater = await db.query(`select nick from person where id = $1`, [post.user_id])
                const createrNick = creater.rows[0]
                if(createrNick === nick){
                    res.json(post)
                }else {
                    const user = await db.query(`select email from person where nick = $1`, [nick])
                    const { email } = user.rows[0]
                    res.json({
                        post,
                        nick: createrNick.nick,
                        email
                    })
                }
            } catch (err) {
                console.log(err)
                res.statusCode.json({
                    message: "Failed to view posts!"
                })
            }
        } else {
            res.json({
                post,
                nick,
            })
        }
    } catch (err) {
        console.log(err)
        res.statusCode.json({
            message: "Failed to get post!"
        })
    }
}

export const getPostByTags = async (req, res) => {
    const { tags } = req.body
    const posts = []
    // await tags.forEach(element => {
        // posts.push(db.query(`select * from post where tags && array[$1]`, [element]))
        console.log(db.query(`// select * from post where tags && array[$1]`, [element]))
    // })
    const postsByTags = await db.query(`select * from post where tags && array[$1]`, [tags[0]])
    console.log(postsByTags.rows)
    res.json({
        success: true
    })
}
export const updatePost = async (req, res) => {
        const { id, title, content, tags } = req.body
        const now = new Date();
        const updatePost = await db.query(`UPDATE post set title = $1, content = $2, date_change = $3, tags = $4 where id = $5 RETURNING *`, [title, content, now, tags, id])
        res.json(updatePost.rows[0])
}
export const deletePostByUser = async (req, res) => {
        const id = req.query.id
        await db.query(`DELETE FROM post where id = $1`, [id])
        res.json({
            message: "Delete post was successful!"
        })
}

export const getFavoritePost = async (req, res) => {
    try{
        const user = req.query.user
        const page = req.query.page
        const favPost = await db.query(`
            select post.*, true isfavorite from post
            inner JOIN favoritepost ON post.id = favoritepost.post_id
            where favoritepost.user_id = $1
            limit 5 offset 5*($2 - 1) 
       `, [user, page])

        const favorites = favPost.rows
        res.json(favorites)
    } catch (err) {
        console.log(err)
        res.statusCode.json({
            message: "Failed to get favorite posts!"
        })
    }
}

export const addFavoritePost = async (req, res) => {
    try{
        const user_id = req.query.user
        const post_id = req.query.post
        await db.query(`INSERT INTO favoritepost (user_id, post_id) VALUES ($1, $2) RETURNING *`, [user_id, post_id])
        res.json(post_id)
    } catch (err) {
        console.log(err)
        res.statusCode.json({
            message: "Failed to add post to favorite!"
        })
    }

}

export const deleteFavoritePost = async (req, res) => {
    const user_id = req.query.user
    const post_id = req.query.post
    await db.query(`delete from favoritepost where user_id = $1 and post_id = $2`, [user_id, post_id])
    res.json(post_id)
}