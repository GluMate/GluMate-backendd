import express from "express";
import { ManualMeasure, getGlucRecords } from "../controllers/glucose.js";
import {  authPatient } from "../middlewears/auth.js";

const router = express.Router();


router.route('/manual').post(authPatient,ManualMeasure);

router.route('/:uid').get(authPatient,getGlucRecords);


export default router;