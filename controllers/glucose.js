

import {validationResult} from "express-validator"
import Glucose from "../models/glucose.js";


export async function ManualMeasure (req,res,next){
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          console.log(errors)
          return res.status(422).json({ errors: errors.array() });
    }

        const { gluc , unit , userId} = req.body
        const glucValue = parseFloat(gluc);
        let minGluc , maxGluc;
    if (unit == 'mg/dL') {
        minGluc = 50;
        maxGluc = 400;
    } else if (unit == 'mmol/L') {
        minGluc = 2.8;
        maxGluc = 22.2;
    } else {
        return res.status(401).json({message : 'invalid unit (mg/dL or mmol/L)'})
    }

    if (gluc <minGluc || gluc >maxGluc){
        return res.status(402).json({message: 'invalid measurements'})
    }

    const Gluc = new Glucose ({
        measured_at : req.body.measured_at,
        gluc : glucValue,
        metadata : 
        {
            type: "manual",
            note: req.body.note,
            userId: userId,
            unit: unit
        }
    })
    await Gluc.save();
    return res.status(200).json(Gluc) ;
    
} catch(e){
    console.log('Error in adding glucose manually:', e);
    res.status(500).send(e);
}
    }

export async function getGlucRecords (req,res,next){
    try{
        const glucs = await Glucose.find({'metadata.userId' : req.params.uid });
        return res.status(200).json(glucs);
      
    } catch (err){
        return res.status(500).json({message: "internal server error"});
    }
}