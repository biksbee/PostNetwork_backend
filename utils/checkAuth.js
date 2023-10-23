import jwt from 'jsonwebtoken'

export const checkAuth = (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    if(token){
        try {
            const decoded = jwt.verify(token, 'secret123')

            req.userId = decoded.id;
            next();
        } catch(err){
            return res.status(403).json({
                message: '1. Not access!'
            })
        }
    } else {
        return res.status(403).json({
            message: 'User is not logged in'
        })
    }
}

export const checkAuthCurrentUser = (req, res, next) => {
    const token = (req.headers.authorization || '').replace(/Bearer\s?/, '');
    if(token){
        try{
            const decoded = jwt.verify(token, 'secret123')
            if(decoded.id === req.body.user_id){
                req.userId = decoded.id;
                next()
            }
        } catch (err) {
            console.log(err)
            return res.status(403).json({
                message: '1. Not access!'
            })
        }
    } else {
        return res.status(403).json({
            message: 'User is not logged in'
        })
    }
}