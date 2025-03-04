import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true},
    email: {type: String,required: true},
    phone: {type: String,required: true},
    password: {type: String,required: true},
    profileImage:{type:String}
})

export default mongoose.model.User||mongoose.model("User",userSchema)
