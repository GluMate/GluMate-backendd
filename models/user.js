import mongoose from "mongoose";


const { Schema ,model } = mongoose ;

const userSchema = new mongoose.Schema({
    UID: { type:String , unique : true},
    firstName: {
      type: String,
      required: false,
    },
    lastName: {
      type: String,
      required: false,
    },
    phone: {
      type: Number,
      required: false,
    },
    email: {
      type: String,
      unique: true,
      required: false,
    },
    pic: {type:String , required: true , default : "profile-pic/default.jpg"},
    role: {
      type: String,
      enum: ["Patient", "Provider"],
      default: "Provider",
    },
  });

const User = mongoose.model('User' , userSchema);
 export default User

