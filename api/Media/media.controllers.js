import {Media} from './media.model'
import jwt from 'jsonwebtoken'
import configKey from '../../config'
import fs from 'fs'
import axios from 'axios'
import moment from 'moment'
//import {saveAs} from 'form-data'
import {fileData,removeBackupone} from './backupCall'
import {getallMedia,getImageMedia,getDoumentMedia,getAlltrashMedia,downloadData} from './media.controllerFunction'

//Upload any File in Database and local storage

export const imageUpload = async(req,res) =>{
    try{
            if(!req.files.length<=0){
                const token = req.query.token
                const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
                const emailId = decoded.sub;
                const notiFileName = '';
                try{
                    await req.files.map(async(file,index) =>{
                        var img = fs.readFileSync(file.path);
                        var encoded_image = img.toString('base64');
                        const document = new Buffer(encoded_image,'base64');
                        const{filename,path,mimetype,orignalname,encoding,destination,size} = file;
                        await Media.create({
                                        filename,path,mimetype,orignalname,encoding,destination,emailId,size,document
                                    })       
                    })
                    console.log(notiFileName);
                    fileData(emailId,token)  //backup call
                    return res.status(201).send({
                                    success: true,
                                    message: "Data Upload Successfully"
                                  });
                }
                catch(err){
                    return res.status(400).send({
                                    success: false,
                                    message: err
                                  });
                }
            }
            else{
                return res.status(200).send({
                    success: true,
                    message: 'file already exisites'
                  });
            }
    }
    catch(err){
        res.status(400).send({success:false, message:err});
    }
} 

// get All media(Document) in gallary

export const getMedia = async(req,res) => {
    try{
        const token = req.query.token;
        const decoded =  jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        getallMedia(decoded.sub,token).then(data =>{
            if(data){
                res.status(200).send({
                    success:true,
                    data
                })
            }
            else{
                res.status(400).send({
                    success:false,
                    message:'file deleted'
                })
            }
        } )
    }
    catch(err){
        res.status(400).send({success:false,message:err})
    }
}

// get all images in gallary ( Like png,jpeg and many more)

export const getImages = async(req,res) => {
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        //console.log(decoded.sub)
        getImageMedia(decoded.sub).then(data =>{
            if(data){
                res.status(200).send({
                    success:true,
                    data
                })
            }
            else{
                res.status(400).send({
                    success:false,
                    message:'Image data does not found'
                })
            }
        })
    }
    catch(err){
        res.status(400).send({success:false,message:err})
    }
}

// get all Document in gallary ( like .pdf, .ppt and Many more)

export const getDocuments = async(req,res) => {
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        getDoumentMedia(decoded.sub).then(data=>{
            if(data){
                res.status(200).send({
                    success:true,
                    data
                })
            }
            else{
                res.status(400).send({
                    success:false,
                    message:'Document Not found'
                })
            }
        })
    }
    catch(err){
        res.status(400).send({success:false,message:err})
    }
}

// remove document and put into trash ( only one document at a time )

export const removeDocument = async(req,res)=>{
    const _id  = req.query._id;
    //console.log(_id);
    try{

        const data = await Media.findByIdAndUpdate({_id:_id},{trash:true})
        if(data){
            //console.log(data.path)
            removeBackupone(_id)
            res.status(200).send({success:true,message:'Document Remove Successfully'})
        }
        else{
            res.status(400).send({success:false,message:'Document Not Found In Database'})
        }
    }
    catch(err){
        res.status(400).send({success:false,message:'Remove Request Fail'})
    }
}

// find All trash document

export const trashDocument = async(req,res)=>{
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);

        const data = await Media.find({emailId:decoded.sub,trash:true})
        getAlltrashMedia(decoded.sub).then(data => {
            if(data){
                res.status(201).send({
                    success:true,
                    data
                })
            }
        })
    }
    catch(err){
        res.status(400).send({success:false,message:'somthing wrong to fetch data'})    
    }
} 

// remove document from trash ( only one document at a time )

export const removeTrash = async(req,res)=>{
    const _id  = req.query._id;
    //console.log(_id);
    try{
        const data = await Media.findOneAndDelete({_id:_id,trash:true})
        if(data){
            console.log(data.path)
            fs.unlinkSync(data.path);
            res.status(200).send({success:true,message:'Trash Empty Successfully'})
        }
        else{
            res.status(400).send({success:false,message:'Document Not Found In Trash'})
        }
    }
    catch(err){
        res.status(400).send({success:false,message:'Remove Request Fail'})
    }
}

// retrive document from trash ( only one document retrive at a time )

export const retriveDocument = async(req,res)=>{
    const _id=req.query._id;
    //console.log(_id);
    try{
        const data = await Media.findOneAndUpdate({_id:_id,trash:true},{trash:false})
        if(data){
            res.status(200).send({success:true,message:'Data Retrive Successfully'})
        }
        else{
            res.status(400).send({success:false,message:'Retrive Document Not Found'})
        }
    }
    catch(err){
        res.status(400).send({success:false,message:'Retrive Request Fail'})
    }
}

// remove all selected trash ( empty trash at one click)

export const emptySelectedTrash = async(req,res)=>{
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        console.log(decoded , req.body)
        req.body.map(async item =>{
            console.log(item, "removed trash")
            const removeItem = await Media.findById({_id:item})
            console.log(removeItem);
            fs.unlinkSync(removeItem.path);
            await Media.findOneAndDelete({_id:item,emailId:decoded.sub,trash:true})
        })
        res.status(200).send({success:true,message:'All Selected Document is Deleted'})
    }
    catch(err){
        res.status(400).send({success:false,message:'Remove Request Fail'})
    }
}

// retrive all selected trash ( retrive all trash in one click)

export const retriveSelectedDocument = async(req,res)=>{
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        console.log(decoded.sub)
        req.body.map(async item =>{
            console.log(item, "retrive document from trash")
            await Media.findOneAndUpdate({_id:item,emailId:decoded.sub},{trash:false})
        })
        res.status(200).send({success:true,message:'All Selected Documents are retrived sucessfully'})
    }
    catch(err){
        res.status(400).send({success:false,message:'Retrive Request Fail'})
    }
}

// remove all selected document and put into trash ( remove all document in one click ) 

export const removeAllSelectedDocument = async(req,res)=>{
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        console.log(req.body)
        req.body.map(async item =>{
            console.log(item, "remove document")
            await Media.findOneAndUpdate({_id:item,emailId:decoded.sub},{trash:true})
        })
        res.status(200).send({success:true,message:'All Selected Document Deleted'})
    }
    catch(err){
        res.status(400).send({success:false,message:'Retrive Request Fail'})
    }
} 

//download selected documents

export const downloadAllSelectedDocument = async(req,res) => {
    try{
        console.log('enter.........')
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
       // console.log(req.body._id)
        const data = await Media.findOne({_id:req.body._id})
        res.status(200).send({filename:data.filename,mimetype:data.mimetype,emailId:data.emailId});
    }
    catch(err){
        res.status(400).send({success:false,message:'Retrive Request Fail'})
    }
}