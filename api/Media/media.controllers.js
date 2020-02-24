import {Media} from './media.model'
import jwt from 'jsonwebtoken'
import configKey from '../../config'
import fs from 'fs'
export const imageUpload = async(req,res) =>{
    try{
            if(req.files){
                const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
                const emailId = decoded.sub;
                const data = Array;
                try{
                    await req.files.map(async(file,index) =>{
                        const{filename,path,mimetype,orignalname,encoding,destination} = file;
                        await Media.create({
                                        filename,path,mimetype,orignalname,encoding,destination,emailId
                                    })
                    })
                    return res.status(201).send({
                                    success: true,
                                    message: "Data Upload Successfully"
                                  });
                }
                catch(err){
                    return res.status(400).send({
                                    success: true,
                                    message: err
                                  });
                }
            }
    }
    catch(err){
        res.status(400).send({success:false, message:err});
    }
} 
export const getMedia = async(req,res) => {
    try{
        const decoded =  jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);

        const data = await Media.find({emailId:decoded.sub,trash:false})
        //console.log(data)
        if(data){
            res.status(200).send({success:true,data})
        }
        else{
            res.status(400).send({success:false,message:'data Does not Uploaded'})
        }
    }
    catch(err){
        res.status(400).send({success:false,message:err})
    }
}

export const getImages = async(req,res) => {
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        console.log(decoded.sub)
        const data = await Media.find({emailId:decoded.sub,mimetype:{ $in: ['image/png',"image/bmp","image/gif",'image/jpeg','image/svg+xml'] },trash:false})
        console.log(data)
        if(data){
            res.status(200).send({success:true,data})
        }
        else{
            res.status(400).send({success:false,message:'data Does not Uploaded'})
        }
    }
    catch(err){
        res.status(400).send({success:false,message:err})
    }
}

export const getDocuments = async(req,res) => {
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);

        const data = await Media.find({emailId:decoded.sub,mimetype:{ $in: ['application/json',
                                                                    "application/vnd.ms-powerpoint",
                                                                    "application/pdf"] },trash:false})
        //console.log(data)
        if(data){
            res.status(200).send({success:true,data})
        }
        else{
            res.status(400).send({success:false,message:'data Does not Uploaded'})
        }
    }
    catch(err){
        res.status(400).send({success:false,message:err})
    }
}

export const removeDocument = async(req,res)=>{
    const _id  = req.query._id;
    console.log(_id);
    try{

        const data = await Media.findByIdAndUpdate({_id:_id},{trash:true})
        if(data){
            console.log(data.path)
           // fs.unlinkSync(data.path);
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

export const trashDocument = async(req,res)=>{
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);

        const data = await Media.find({emailId:decoded.sub,trash:true})
        if(data){
            //console.log(data)
            res.status(200).send({success:true,data})
        }
        else{
            res.status(400).send({success:false,message:'Trash Not Found In DataBase'})
        }
    }
    catch(err){
        res.status(400).send({success:false,message:'somthing wrong to fetch data'})    
    }
} 

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

export const emptySelectedTrash = async(req,res)=>{
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        console.log(decoded , req.body)
        req.body.map(async item =>{
            console.log(item, "-----------------------------------------")
            const data = await Media.findOneAndDelete({_id:item,emailId:decoded.sub,trash:true})
            fs.unlinkSync(data.path);
        })
        res.status(200).send({success:true,message:'All Selected Document is Deleted'})
    }
    catch(err){
        res.status(400).send({success:false,message:'Remove Request Fail'})
    }
}

export const retriveSelectedDocument = async(req,res)=>{
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        console.log(decoded.sub)
        req.body.map(async item =>{
            console.log(item, "-----------------------------------------")
            await Media.findOneAndUpdate({_id:item,emailId:decoded.sub},{trash:false})
        })
        res.status(200).send({success:true,message:'All Selected Documents are retrived sucessfully'})
    }
    catch(err){
        res.status(400).send({success:false,message:'Retrive Request Fail'})
    }
}

export const removeAllSelectedDocument = async(req,res)=>{
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        console.log(req.body)
        req.body.map(async item =>{
            console.log(item, "-----------------------------------------")
            await Media.findOneAndUpdate({_id:item,emailId:decoded.sub},{trash:true})
        })
        res.status(200).send({success:true,message:'All Selected Document Deleted'})
    }
    catch(err){
        res.status(400).send({success:false,message:'Retrive Request Fail'})
    }
} 