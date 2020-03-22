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
            const src = path.join(__dirname,'..','..','public', "profileImage.png");
            fs.mkdirSync(uploadDir)
            copyFile(src, path.join(uploadDir, 'profileImage'));
            cb(null, uploadDir)
        }
    },
    filename:function(req,file,cb){
        console.log()
        cb(null,"profileImage")
    },
    
})
const upload = multer({storage:storage
    })
export const userRouter  = express.Router();

userRouter.route('/').get(getUserDetails)
userRouter.route('/pimg').post(upload.single('file'),(req,res)=>{
    res.status(200).send({message:'update success',success:'true'})
})
userRouter.route('/updatedata').post(updateData)