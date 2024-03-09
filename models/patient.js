import mongoose from "mongoose";
import User from "./user.js";
const { Schema , model } = mongoose;

const patientSchema = new mongoose.Schema({
   Gender : {type: String , required : true},
   // diabeteType : { type:String },
   // GlucTargets : { type:String },
   dateOfBirth : {type:Date , required : true},
   Providers : [{type : mongoose.Schema.Types.ObjectId , ref: 'Provider'}]
});

const Patient = User.discriminator('Patient',patientSchema);

export default Patient;