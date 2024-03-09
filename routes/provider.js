import express from "express";
//import { PatientRegister } from "../controllers/user.js";
import { validateEmailPassword } from "../middlewears/validator.js";
import { authProvider } from "../middlewears/auth.js";
import { providerRegister, getPatientsForProvider, DiplomasUpload } from "../controllers/provider.js";

const router = express.Router();


router.route('/providerRegister').post( validateEmailPassword,providerRegister);
router.route('/uploadDiplomas').patch( authProvider,DiplomasUpload);

router.route('/getPatientsForProvider').get( authProvider,getPatientsForProvider);
// router.route("/:providerId").post(authProvider, assignProviderToPatient);





export default router;