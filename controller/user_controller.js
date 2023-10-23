import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import { db } from '../db.js'
import 'dotenv/config'

export const createUser = async (req, res) => {
    try {
        const {name, nick, email, password, avatarUrl} = req.body

        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(password, salt)
        //create uniq NICKNAME
        const newPerson = await db.query(`
            INSERT INTO person (name, nick, email, passwordHash, avatarUrl)
                values ($1, $2, $3, $4, $5) RETURNING *`, [name, nick, email, passwordHash, avatarUrl])

        const token = jwt.sign(
            {     //благодаря jwt токену смогу определяь авторизован ли пользователь
                id: newPerson.rows[0].id
            },
            process.env.SECRET_PRIVATE_KEY,
            {
                expiresIn: process.env.EXPIRE_IN
            }
        );

        const { passwordhash, ...userData } = newPerson.rows[0]
        res.json({
            ...userData,
            token
        })
    } catch (err) {
        console.log(err)
        res.statusCode.json({
            message: 'Registration attempt failed!',
        });
    }
}
export const signInUser = async (req, res) => {
        try{
            const { nick, password } = req.body
            const login_person = await db.query(`select * from person where nick = $1`, [nick])
            if(!login_person){
                return res.status(404).json({
                    message: `Nick or password is invalid. Please try again)`
                })
            }
            const isValidPass = await bcrypt.compare(password, login_person.rows[0].passwordhash)

            if(!isValidPass){
                return res.status(404).json({
                    message: `Nick or password is invalid. Please try again)`
                })
            }


            const token = jwt.sign(
                {     //благодаря jwt токену смогу определяь авторизован ли пользователь
                    id: login_person.rows[0].id
                },
                // `secret_${nick}`,
                    'secret123',
                {
                    expiresIn: '30d'
                }
            );
            const { passwordhash, ...userData } = login_person.rows[0]
            res.json({
                ...userData,
                token
            })
        } catch(err){
            console.log(err)
            res.status(404).json({
                message: 'login was failed!'
            })
        }
    }
export const updateUser = async (req, res) => {
        try {
            const { id, name, nick, email, password, avatarUrl } = req.body


            const salt = await bcrypt.genSalt(10)
            const new_passwordhash = await bcrypt.hash(password, salt)

            const user = await db.query(`
            UPDATE person set name = $1, nick = $2, email = $3, passwordhash = $4, avatarUrl = $5 
                where id = $6 RETURNING *`,
                [name, nick, email, new_passwordhash, avatarUrl, id])

            const token = jwt.sign(
                {     //благодаря jwt токену смогу определяь авторизован ли пользователь
                    id: user.rows[0].id
                },
                // `secret_${nick}`,
                'secret123',
                {
                    expiresIn: '30d'
                }
            );
            const { passwordhash, ...userData } = user.rows[0]
            res.json({
                ...userData,
                token
            })
        } catch (err) {
            console.log(err)
            res.statusCode.json({
                message: 'Change value attempt failed!'
            })
        }
    }
export const getUsers = async (req, res) => {
    const users = await db.query(`SELECT * FROM person`)
    res.json(users.rows)
}
export const getOneUser = async (req, res) => {
        try{
            const user = await db.query(`SELECT * from person where id = $1`, [req.userId])
            if(!user){
                return res.status(404).json({
                    message: 'User not found!'
                })
            }
            const { passwordhash, ...userData } = user.rows[0]
            res.json(userData)
        } catch (err) {
            console.log(err)
            res.statusCode.json({
                message: 'Get user attempt failed!'
            })
        }

    }
export const deleteUser = async (req, res) => {
    const user = await db.query(`DELETE FROM person where id = $1`, [req.userId])
    res.json(user.rows[0])
}
