import mongoose, {Schema} from 'mongoose';
import timestamps from "mongoose-timestamp";

const msgSchema = Schema({
    emailId:String,
    message:String,
    type:{type: String, default: 'user'},

}, { timestamps: { createdAt: 'created_at' } })

export const Message = mongoose.model('Message',msgSchema);