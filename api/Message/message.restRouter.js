import express from 'express'
import {messageSender, sendMsgByAdimin, showMessage} from './message.controller'
import {Message} from './message.model'

export const messageRouter = express.Router();
messageRouter.route('/').get(showMessage).post(sendMsgByAdimin);
messageRouter.route('/send').post(messageSender)