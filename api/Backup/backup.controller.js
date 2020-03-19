import {Media} from './../Media'
import {Users} from './../users'
import jwt from 'jsonwebtoken'
import configKey from '../../config'
import axios from 'axios'
export const allDataBackUp = async(req,res) => {
    try{
    const token = req.query.token
    const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
    const data = await Users.findOne({emailId:decoded.sub})
    //console.log(data.role)
    if(data.role=='admin')
    {
        const data = await Media.aggregate([
            {
                $match:{}
            },
            {
                $project:{
                    _id:1,
                    emailId:1,
                    filename:1
                }
            }
        ])
        console.log(data,' ...............backup all data')
        axios.post("http://localhost:8000/api/backup/retriveallbackup?token="+token,data)
        .then(valid =>{
            if(valid.data.success){
                valid.data.backup.map(async(item)=>{
                    await Media.create(item)
                })
                res.status(201).send({success:true,message:'backup successfully'})
            }
            else{
                res.status(200).send({success:false,message:'backup fail due to some reason'})
            }
        })
    }
    else{
        res.status(200).send({success:false,message:'authentication failed \n you are not valid user for backup'})
    }
    }
    catch(err){
        res.status(400).send({success:false})
    }
}

export const emailDataBackUp = async(req,res) =>{
    try{
        const token = req.query.token
        const decoded = await jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        const data = await Users.findOne({emailId:decoded.sub})
        console.log(req.body.emailId)
        if(data.role=='admin')
        {
            const data = await Media.aggregate([
                {
                    $match:{emailId:req.body.emailId}
                },
                {
                    $project:{
                        _id:1,
                        emailId:1,
                        filename:1
                    }
                }
            ])
            //console.log(data)
            axios.post("http://localhost:8000/api/backup/retriveemailbackup?token="+token,data)
            .then(valid =>{
                if(valid.data.success){
                    valid.data.backup.map(async(item)=>{
                        await Media.create(item)
                    })
                    res.status(201).send({success:true,message:'backup successfully'})
                }
                else{
                    res.status(200).send({success:false,message:'backup fail due to some reason'})
                }
            })
        }
    }
    catch(err){
        res.status(400).send({success:false})
    }
}