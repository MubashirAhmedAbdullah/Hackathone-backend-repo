import mongoose from "mongoose";

const {Schema} = mongoose
const UserSchema = Schema(
    {
        name: {type: String, trim: true},
        father_name: {type: String, trim: true},
        email: {type: String, required: true, unique: true},
        cnic: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        role: {type: String, enum:["user","admin"], default:"user"},
        phone: {type: String},
        address: {type: String},
        DOB: {type: String},
        city: {type: String, trim: true},
        country: {type: String, trim: true}
    },{
        timestamps: true
    }
)


const User = mongoose.model("users", UserSchema);


export default User