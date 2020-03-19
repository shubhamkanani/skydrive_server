import mongoose, {Schema} from 'mongoose';
import timestamps from "mongoose-timestamp";

const userSchema = Schema({
    firstName:String,
    lastName:String,
    emailId:String,
    password:String,
    role:String,
    pImg:String,
    bImg:String
}, { timestamps: { createdAt: 'created_at' } })

export const Users = mongoose.model('users',userSchema);