import express from "express";
import { ManualMeasure, fetchGlucByTime, getGlucRecords } from "../controllers/glucose.js";
import {  authPatient } from "../middlewears/auth.js";

const router = express.Router();


router.route('/manual').post(authPatient,ManualMeasure);

router.route('/:uid').get(authPatient,getGlucRecords);

router.route('/fetch/ByTime/:start/:end/:granularity').get(authPatient,fetchGlucByTime);

export default router;