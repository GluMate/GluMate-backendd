import mongoose from "mongoose";
import User from "./user.js";

const { model , Schema} = mongoose;

const providerSchema = new mongoose.Schema({
    bio : {type:String},
    clinicHours : {type:String},
    address: {
        coordinates: {
            type: [Number],
            index: '2dsphere' // Index for geospatial queries
        }
        // localization : {

        // }
    },
    diplomaVerification: {
        isVerified: { type: Boolean, required: true, default: false },
        verificationDocuments: [{ type: String, required: false }],
        specialization: {type:String , required : false},
      },
    ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
     Patients : [{type : mongoose.Schema.Types.ObjectId , ref: 'Patient'}]



});

const Provider = User.discriminator("Provider",providerSchema);

export default Provider;