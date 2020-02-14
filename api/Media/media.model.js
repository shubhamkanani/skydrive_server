import mongoose, {Schema} from 'mongoose';
import timestamps from "mongoose-timestamp";

const userSchema = Schema({
    emailId:String,
    filename:String,
    originalname:String,
    mimetype:String,
    encoding:String,
    path:String,
    destination:String,

}, { timestamps: { createdAt: 'created_at' } })

export const Media = mongoose.model('Media',userSchema);