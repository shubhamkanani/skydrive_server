import express from 'express'
 import {mediaRouter} from './Media'
 import {userRouter} from './users'
 import {notifiactionRouter} from './Notifications'
 import {backupRouter} from './Backup'
 export const restRouter = express.Router();

restRouter.use('/userdetails',userRouter)
restRouter.use('/upload',mediaRouter);
restRouter.use('/notification',notifiactionRouter)
restRouter.use('/backup',backupRouter)
// restRouter.use('/matirial',materialRouter);