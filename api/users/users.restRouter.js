import express from 'express'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import configKey from '../../config'
import path from 'path'
import fs from 'fs'
import {getUserDetails,setUserImg,updateData} from './users.controller'

var storage = multer.diskStorage({
    destination: async function(req, file, cb){
        console.log(file, 'restrouter')
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        const uploadDir = path.join(__dirname,'..','..','public','uploads',decoded.sub);
        if (fs.existsSync(uploadDir)){
            cb(null, uploadDir)
        }
        else{
            fs.mkdirSync(uploadDir)
            cb(null, uploadDir)
        }
    },
    filename:function(req,file,cb){
        console.log()
        cb(null,file.originalname)
    },
    
})
const upload = multer({storage:storage,
    fileFilter:async function (req, file, cb){
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        const uploadDir = path.join(__dirname,'..','..','public','uploads',decoded.sub);
        if(fs.existsSync(uploadDir+'/'+file.originalname)){
            
            return cb(null, false, new Error(file.originalname+'already existes'));
        }
        cb(null,true);
    }
    })
export const userRouter  = express.Router();

userRouter.route('/').get(getUserDetails)
userRouter.route('/pimg').post(upload.single('file'),setUserImg)
userRouter.route('/updatedata').post(updateData)