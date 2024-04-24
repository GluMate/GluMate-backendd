

import {validationResult} from "express-validator"
import Glucose from "../models/glucose.js";
import User from "../models/user.js";


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

    export async function getGlucRecords (req, res, next) {
        if (!req.auth || !req.auth.uid) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        
        try {
            const glucs = await Glucose.find({'metadata.userId' : req.params.uid })
                                       .sort({ measured_at: -1 }) // Sort by timestamp in descending order
                                       .limit(100); // Limit to 100 records
            return res.status(200).json(glucs);
          
        } catch (err) {
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    

    export async function fetchGlucByTime(req, res, next) {
        const { start, end, granularity } = req.params;
        if (!req.auth || !req.auth.uid) {
            return res.status(400).json({ error: "Invalid user ID" });
        }
        try {
            const user = await User.findOne({ UID: req.auth.uid });
            let records;
    
            switch (granularity) {
                case 'daily':
                    records = await getDailyRecords(start, end, user._id);
                    break;
                case 'hourly':
                    records = await getHourlyRecords(start, end, user._id);
                    break;
                 case 'monthly':
                        records = await getMonthlyRecords(start, end, user._id);
                        break;
                default:
                    records = await Glucose.find({
                        measured_at: { $gte: start, $lte: end },
                        'metadata.userId': user._id
                    });
                    break;
            }
    
            return res.status(200).json(records);
        } catch (err) {
            console.log(err);
            return res.status(500).json({ err });
        }
    }
    
    async function getDailyRecords(start, end, userId) {
        // Adjust granularity to daily
        return Glucose.aggregate([
            {
                $match: {
                    measured_at: { $gte: new Date(start), $lte: new Date(end) },
                    'metadata.userId': userId
                }
            },
            {
                $addFields: {
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$measured_at" } }
                }
            },
            {
                $group: {
                    _id: "$date",
                    averageGluc: { $avg: "$gluc" } 
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    gluc: "$averageGluc"
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ]);
    }
    async function getMonthlyRecords(start, end, userId) {
        return Glucose.aggregate([
            {
                $match: {
                    measured_at: { $gte: new Date(start), $lte: new Date(end) },
                    'metadata.userId': userId
                }
            },
            {
                $addFields: {
                    year: { $year: "$measured_at" },
                    month: { $month: "$measured_at" }
                }
            },
            {
                $group: {
                    _id: { year: "$year", month: "$month" },
                    averageGluc: { $avg: "$gluc" } 
                }
            },
            {
                $addFields: {
                    date: {
                        $dateFromParts: {
                            year: "$_id.year",
                            month: "$_id.month",
                            day: 1 // Set the day to 1 to represent the first day of the month
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    gluc: "$averageGluc"
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ]);
    }
    
    async function getHourlyRecords(start, end, userId) {
        // Adjust granularity to hourly with at least 5 capped values per hour
        return Glucose.aggregate([
            {
                $match: {
                    measured_at: { $gte: new Date(start), $lte: new Date(end) },
                    'metadata.userId': userId
                }
            },
            {
                $addFields: {
                    hour: {
                        $dateFromString: {
                            dateString: {
                                $dateToString: {
                                    format: "%Y-%m-%d %H:%M",
                                    date: {
                                        $toDate: {
                                            $subtract: [
                                                { $toLong: "$measured_at" },
                                                { $mod: [{ $toLong: "$measured_at" }, 1000 * 60 * 15] }
                                            ]
                                        }
                                    }
                                }
                            },
                            format: "%Y-%m-%d %H:%M"
                        }
                    }
                }
            },
            {
                $group: {
                    _id: "$hour",
                    data: { $push: "$$ROOT" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    gluc: {
                        $cond: {
                            if: { $gt: [{ $size: "$data" }, 5] }, // If more than 5 data points
                            then: { $avg: "$data.gluc" }, // Calculate average glucose value
                            else: { $arrayElemAt: ["$data.gluc", 0] } // Take the first glucose value
                        }
                    }
                }
            },
            {
                $sort: { date: 1 } // Sort by date in ascending order
            }
        ]);
    }
    
    

    