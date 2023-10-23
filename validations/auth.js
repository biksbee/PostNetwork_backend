import { body } from 'express-validator'


export const loginValidator = {
    nick: /^[a-z0-9_.]{3,}$/,
    password: /^.{2,50}$/i,
}
export const registerValidator = {
    name: /^[A-Z]{2,40}(-|)[A-Z]{2,40}$/i,
    email: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    password: /^.{2,50}$/i,
    avatarUrl: /^http(s|):\/\/(www.|)[A-Z0-9]{2,}\.[A-Z]{2,}(\/|)+[A-Z0-9._]{2,}$/i
}

export const postValidator = {
    title: /^[a-z0-9]{3,}$/,
    content: /^.{3,250}$/,
}