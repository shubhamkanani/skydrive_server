import {Media} from './media.model'
import axios from 'axios'
export const fileData = async(emailId,token) => {
    const totalBackupItem = await Media.aggregate([
        {
            $match:{
                emailId:emailId,
                backup:false,
                trash:false
            }
        },
        {
            $project:{
                _id:1,
                filename:1,
                path:1,
                mimetype:1,
                encoding:1,
                destination:1,
                emailId:1,
                size:1,
                document:1,
            }
        }
    ])
    //console.log(totalBackupItem)
    const config = {
        maxContentLength: 52428890,
        ssl: true,
        };
    totalBackupItem.map((item,index)=>{
        axios.post("http://localhost:8000/api/backup?token="+token,item,config)
        .then(async res => {
            if(res.data.success){
                await Media.findByIdAndUpdate({_id:res.data._id},{backup:true})
            }
            else{
                console.log(res.data.message)
            }
        });
    })
    return null
}

export const removeBackupone =async(_id)=>{
    //console.log('enter')
    axios.delete("http://localhost:8000/api/backup/remove?_id="+_id)
        .then(async res=>{
            if(res.data.success){
                await Media.findOneAndUpdate({_id:res.data._id},{backup:false})
                console.log(res.data.message)
            }
        })
    return null
}