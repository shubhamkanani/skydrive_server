import express, { Router } from 'express'
import {allDataBackUp,emailDataBackUp} from './backup.controller'
export const backupRouter = express.Router();

backupRouter.route('/allbackup').get(allDataBackUp).post(emailDataBackUp);