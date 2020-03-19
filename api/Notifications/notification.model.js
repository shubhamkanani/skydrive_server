import mongoose, {Schema} from 'mongoose';
import timestamps from "mongoose-timestamp";

const notiSchema = Schema({
    emailId:String,
    Heading:String,
    data:String,
    seen:{type: Boolean, default: false},

}, { timestamps: { createdAt: 'created_at' } })

export const Notification = mongoose.model('Notification',notiSchema);