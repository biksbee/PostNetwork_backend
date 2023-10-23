import Router from 'express'
import { createUser, signInUser, getUsers, updateUser, getOneUser, deleteUser } from "../controller/user_controller.js";
import { checkAuth } from "../utils/checkAuth.js";

export const userRouter = new Router()

userRouter.post('/user', createUser)
userRouter.get('/user/all', getUsers)
userRouter.get('/user/', checkAuth, getOneUser)
userRouter.put('/user', checkAuth, updateUser)
userRouter.delete('/user/', checkAuth, deleteUser)

userRouter.post('/user/login', signInUser)
