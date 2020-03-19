import mongoose, {Schema} from 'mongoose';
import timestamps from "mongoose-timestamp";

const userSchema = Schema({
    emailId:String,
    filename:String,
    mimetype:String,
    encoding:String,
    path:String,
    destination:String,
    size:Number,
    document:Buffer,
    trash:{type: Boolean, default: false},
    backup:{type: Boolean, default: false}

}, { timestamps: { createdAt: 'created_at' } })

export const Media = mongoose.model('Media',userSchema);