import {Message} from './message.model'
import jwt from 'jsonwebtoken'
import configKey from '../../config'
export const messageSender = async (req,res)=>{
        try{
            console.log(req.body)
            const decoded =  await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
            const message = {
                emailId:decoded.sub,
                message:req.body.message
            }
            await Message.create(message)
            return res.status(200).send({message:'message send successfully',success:true})

        }
        catch (e) {
            return res.status(400).send({message:e,success:false})
        }
}

export const showMessage = async (req,res) =>{
    try{
        //console.log(req.query.token)
        if(!req.query.token){
            const  data = await Message.find({})
            return  res.status(200).send({success:true,data:data})
        }
        else {
            const decoded =  await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
            const data = await Message.find({emailId: decoded.sub})
            return  res.status(200).send({success:true,data:data})
        }
    }
    catch (e) {
        return res.status(400).send({message:e,success:false})
    }
}

export  const sendMsgByAdimin = async (req,res) =>{
    try{
        const Udata = req.body;
        await Message.create(Udata)
        const  data = await Message.find({})
        return  res.status(200).send({success:true,data:data})
    }
    catch (e) {
        return res.status(400).send({message:e,success:false})
    }
}