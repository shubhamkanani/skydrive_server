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
                    req.files.map(async(file,index) =>{
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
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);

        const data = await Media.find({emailId:decoded.sub})
        console.log(data)
        if(data){
            res.status(200).send({success:true,data})
        }
        res.status(400).send({success:false,message:'data Does not Uploaded'})
    }
    catch(err){
        res.status(400).send({success:false,message:err})
    }
}

export const getImages = async(req,res) => {
    try{
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);

        const data = await Media.find({emailId:decoded.sub,mimetype:{ $in: ['image/png',"image/bmp","image/gif",'image/jpeg','image/svg+xml'] }})
        console.log(data)
        if(data){
            res.status(200).send({success:true,data})
        }
        res.status(400).send({success:false,message:'data Does not Uploaded'})
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
                                                                    "application/pdf"] }})
        console.log(data)
        if(data){
            res.status(200).send({success:true,data})
        }
        res.status(400).send({success:false,message:'data Does not Uploaded'})
    }
    catch(err){
        res.status(400).send({success:false,message:err})
    }
}

export const removeDocument = async(req,res)=>{
    const _id  = req.query._id;
    console.log(_id);
    try{

        const data = await Media.findOneAndDelete({_id:_id})
        if(data){
            console.log(data.path)
            fs.unlinkSync(data.path);
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