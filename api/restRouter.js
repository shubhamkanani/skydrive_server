import express from 'express'
 import {mediaRouter} from './Media'
// import {materialRouter} from './Matirial'
export const restRouter = express.Router();

restRouter.use('/upload',mediaRouter);
// restRouter.use('/matirial',materialRouter);