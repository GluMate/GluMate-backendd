import mongoose from "mongoose";


const {model , Schema} = mongoose


const glucSchema = new mongoose.Schema(
    {
        measured_at : {type: Date , required : true} ,
        gluc : {type: Number , required : true} , 
        metadata: {
            userId: {type: mongoose.Schema.Types.ObjectId , ref: 'User' , required: true},
            note:  {type: String , enum: ['before meal','after meal','after medication','after working','before medication','fasting','auto'], required: true},
            type: {type: String , enum: ['manual','device'] , required: true},
            unit: {type: String , enum: ['mg/dL','mmol/L'] }
        },
    },
    {
        timeseries: {
            timeField: 'measured_at',
            metaField: 'gluc',
            granularity: 'minutes' ,
        },
    }
);

const Glucose = mongoose.model('Glucose' , glucSchema);
 export default Glucose