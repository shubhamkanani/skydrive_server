import {Users} from './users.model'
import{Media} from './../Media'
import jwt from 'jsonwebtoken'
import configKey from '../../config'
import fs from 'fs'
import bcrypt from 'bcrypt-nodejs'
import axios from 'axios'
export const getUserDetails = async(req,res) => {
    try{
        const decoded =  jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
        const data = await Users.aggregate([
            {
                $match: {
                  emailId: decoded.sub
                }
              },
              {
                $project:{
                  userId: "$_id",
                  colId: 1,
                  firstName: 1,
                  lastName: 1,
                  emailId: 1,
                  mobileNo: 1,
                  role: 1,
                }
              }
        ])
        return res.status(201).send({success:true,data})
    }
    catch(err){
        return res.status(400).send({
            success: false,
            message: err
          });
    }
}


export const updateData = async(req,res) =>{
  try{
      const decoded = jwt.verify(req.query.token, configKey.secrets.JWT_SECRET);
      //console.log(req.body)
        if(req.body.newPassword && req.body.oldPassword){
            //console.log("enter.........")
            const userInfo = await Users.findOne({emailId:decoded.sub}) 
            const validPassword = await bcrypt.compareSync(req.body.oldPassword, userInfo.password);
            if(validPassword){
              const newPassword = bcrypt.hashSync(req.body.newPassword);
              await Users.findOneAndUpdate({emailId:decoded.sub},{password:newPassword})
              res.status(200).send({
                success:true,
                message:'password change successfully'
              })
              console.log("Password change successfully")
            }
            else{
              res.status(200).send({
                success:false,
                message:'oldpassword does not match'
              })
              console.log("Password change failed due to old password miss match")
            }
        }
        if(!(req.body.newPassword && req.body.oldPassword)){
          //console.log("enter.........")
          if(req.body.emailId!=decoded.sub){
            console.log("enter.........", '/n' , req.body, decoded.sub)
            const notvalidmail = await Users.findOne({emailId:req.body.emailId})
            
            if(!notvalidmail){
              console.log("enter.........")
              const userInfo = await Media.findOne({emailId:decoded.sub})
              if(userInfo){
                var Rdestination = userInfo.destination.replace(decoded.sub,req.body.emailId)
                console.log(Rdestination, 'new email path')

                const totalItem = await Media.find({emailId:decoded.sub})
                console.log(totalItem,'...................')
                totalItem.map(async(item)=>{
                  const Rpath = Rdestination+'/'+item.filename
                  await Media.findOneAndUpdate({_id:item._id},{path:Rpath,destination:Rdestination,emailId:req.body.emailId})
                })
                fs.renameSync(userInfo.destination,Rdestination, function (err) {
                  if (err) throw err;
                  console.log('renamed complete' , Rdestination);
                });
              }
              
              await Users.findOneAndUpdate({emailId:decoded.sub},{emailId:req.body.emailId,
                                                                      firstName:req.body.firstName,
                                                                      lastName:req.body.lastName
                                                                    })
                                                                    console.log('rich')
              const data = {
                Rdestination:Rdestination,
                emailId:decoded.sub,
              }
              console.log(data)
             axios.post("http://localhost:8000/api/backup/updatebackup?token="+req.query.token,data)
             .then(res=>{
               console.log(res.message, 'backup drive email change')
             })
             .catch(err =>{
               console.log(err);
             })
            res.status(200).send({
              success:true,
              echange:true,
              message:'profile change successfully'
            })
            console.log("profile change successfully")
            }
            else{
              res.status(200).send({
                success:false,
                message:'Email already registered'
              })
              console.log("change fail due to use wrong mail")
            }
          }
          else{
            console.log("enter.........")
            await Users.findOneAndUpdate({emailId:decoded.sub},{firstName:req.body.firstName,
              lastName:req.body.lastName
            })
            res.status(200).send({
              success:true,
              message:'profile change successfully'
            })
            console.log("profile change successfully")
          }
      }
  }
  catch(err){
    res.status(400).send({
      success:false,
      message:err
    })
  }
}