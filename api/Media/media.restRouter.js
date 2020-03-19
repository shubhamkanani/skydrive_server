import express from "express";
import {imageUpload,getMedia,getImages,getDocuments,removeDocument,trashDocument,removeTrash,retriveDocument,emptySelectedTrash,retriveSelectedDocument,removeAllSelectedDocument,downloadAllSelectedDocument} from "./media.controllers";
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import configKey from '../../config'
import jwt from 'jsonwebtoken'

var storage = multer.diskStorage({
    destination: async function(req, file, cb){
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
export const mediaRouter  = express.Router();
mediaRouter.route('/').get(getMedia).post(upload.array('file'),imageUpload)
mediaRouter.route('/images').get(getImages);
mediaRouter.route('/documents').get(getDocuments);
mediaRouter.route('/removeitem').delete(removeDocument);
mediaRouter.route('/trash').get(trashDocument).delete(removeTrash).post(retriveDocument)
mediaRouter.route('/selectedtrash').delete(emptySelectedTrash).post(retriveSelectedDocument)
mediaRouter.route('/selected').post(removeAllSelectedDocument);
mediaRouter.route('/download').post(downloadAllSelectedDocument);