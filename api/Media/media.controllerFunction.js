import {Media} from './media.model'
import axios from 'axios'

// find all media(Document) from database

export const getallMedia =async(emailId,token)=>{
    const data =  await Media.aggregate([
        {
            $match:{
                emailId:emailId,
                trash:false
            }
        },
        {
            $project:{
                _id:1,
                filename:1,
                path:1,
                mimetype:1,
                destination:1,
                emailId:1,
                size:1,
                createdAt:1
            }
        }
    ])

    // check backup make successfull or not

    const API_DATA = await Media.aggregate([
        {
            $match:{
                emailId:emailId,
                backup:true,
                trash:false
            }
        },
        {
            $project:{
                _id:1,
                filename:1
            }
        }
    ])
   // console.log(token)
    API_DATA.map((item,index)=>{
        console.log(item)
        axios.post("http://localhost:8000/api/backup/checkbackup?token="+token,item)
        .then(async res =>{
            if(res.data.success){
                await Media.findByIdAndUpdate({_id:res.data._id},{backup:false})
            }
        })
    })
    return data
}

//find all images from database

export const getImageMedia =async(emailId)=>{
    const data =  await Media.aggregate([
        {
            $match:{
                emailId:emailId,
                mimetype:{ $in: ['image/png',"image/bmp","image/gif",'image/jpeg','image/svg+xml'] },
                trash:false
            }
        },
        {
            $project:{
                _id:1,
                filename:1,
                path:1,
                mimetype:1,
                destination:1,
                emailId:1,
                size:1,
                createdAt:1
            }
        }
    ])
    return data
}

// find all document like pdf or more from databass

export const getDoumentMedia =async(emailId)=>{
    const data =  await Media.aggregate([
        {
            $match:{
                emailId:emailId,
                mimetype:{ $in: ['application/json', "application/vnd.ms-powerpoint","application/pdf"] },
                trash:false
            }
        },
        {
            $project:{
                _id:1,
                filename:1,
                path:1,
                mimetype:1,
                destination:1,
                emailId:1,
                size:1,
                createdAt:1
            }
        }
    ])
    return data
}

// find all trash from database

export const getAlltrashMedia =async(emailId)=>{
    const data =  await Media.aggregate([
        {
            $match:{
                emailId:emailId,
                trash:true
            }
        },
        {
            $project:{
                _id:1,
                filename:1,
                path:1,
                mimetype:1,
                destination:1,
                emailId:1,
                size:1,
                createdAt:1
            }
        }
    ])
    return data
}

export const downloadData = async(emailId,data)=>{
    
    data.map(async item => {
        const data = await Media.aggregate([
            {
                $match:{
                    _id:item,
                    emailId:emailId,
                }
            },
            {
                $project:{
                    document:1
                }
            }
        ])
        console.log(data)
    })
}