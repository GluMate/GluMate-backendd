import express from "express";
//import { PatientRegister } from "../controllers/user.js";
import { validateEmailPassword } from "../middlewears/validator.js";
import { auth, authPatient } from "../middlewears/auth.js";
import {  updateUser } from "../controllers/provider.js";
import { PatientRegister ,ProfilePicUpload,consulterProfil,findUserByUID, getProvidersForPatients} from "../controllers/user.js";

const router = express.Router();



router.route('/getProvidersForPatient').get( authPatient,getProvidersForPatients);
router.route('/patientRegister').post(validateEmailPassword,PatientRegister);
router.route('/updateProfile').put(auth,updateUser);
router.route('/uploadProfilePic').patch(auth,ProfilePicUpload);
router.route("/profil").get(auth,consulterProfil);
router.route('/:uid').get(findUserByUID);





export default router;