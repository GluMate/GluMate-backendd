import Patient from "../models/patient.js";
import Provider from "../models/provider.js";
import User from "../models/user.js";
import admin from "firebase-admin"
import {validationResult} from "express-validator"
import uploadProfilePic from "../middlewears/multer-profilePic.js";
import otpGenerator from 'otp-generator';
import Otp from '../models/otp.js';
import { OtpEmailOptions } from "../utils/OtpEmail-template.js";
import nodemailer from "nodemailer";

export async function PatientRegister(req, res, next) {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(422).json({ errors: errors.array() });
    }
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "It seems that you already have an account" });
        }
        // Create a new patient object
        const patient = new Patient({
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            dateOfBirth: req.body.dateOfBirth,
            Gender: req.body.gender,
            role: "Patient",
        });

        // Save the patient to MongoDB
        let savedPatient;
        try {
            savedPatient = await patient.save();
        } catch (error) {
            console.log('Error saving patient to MongoDB:', error);
            return res.status(500).send(error);
        }
        let userRecord;
        try {
            userRecord = await admin.auth().createUser({
                email: req.body.email,
                password: req.body.password
            });
            await admin.auth().setCustomUserClaims(userRecord.uid, {
                role: 'patient' // Set the user's role 
            });
        } catch (error) {
            console.log('Error creating user in Firebase:', error);
            // If Firebase registration fails, delete the patient record from MongoDB
            try {
                await savedPatient.delete();
            } catch (deleteError) {
                console.log('Error deleting patient from MongoDB:', deleteError);
            }
            return res.status(500).send(error);
        }

        // Update the patient document with the UID from Firebase
        savedPatient.UID = userRecord.uid;
        await savedPatient.save();

        // Send success response
        res.status(200).json(savedPatient);
    } catch (error) {
        console.log('Error in PatientRegister:', error);
        res.status(500).send(error);
    }
}

export async function findUserByUID(req,res,next){
    try {
        const user = await User.findOne({ UID: req.params.uid });
        if (user) {
            return res.status(200).json(user);
        } else {
            return res.status(401).json({message : "user not found"});
        }

    } catch (e) {
        console.log('Error in finding user:', error);
        res.status(500).send(error);
    }

}

export function consulterProfil(req, res) {
    User.findOne({ UID: req.auth.uid })
      .then((docs) => {
        res.status(200).json(docs);
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
  }

export  async function ProfilePicUpload (req,res,next){
    uploadProfilePic.single('pic')(req, res,async (err) => {
      if (err) {   
        return res.status(500).json({ error: err.message }); 
      } 
      
      try {         
        if (!req.auth || !req.auth.uid) {
            return res.status(400).json({ error: "Invalid user ID" });
          }
      const updateData = req.file.path;
      User.findOne({ UID: req.auth.uid })
      .then((user) => {
        if (user.role === "Patient") {
          User.findOneAndUpdate({ UID: req.auth.uid },  {pic: updateData}, {
            new: true,
          })
            .then((updatedPatient) => {
              res.status(200).json(updatedPatient);
            })
            .catch((err) => {
              res.status(500).json({ error: err });
            });
        } else if (user.role === "Provider") {
          Provider.findOneAndUpdate({ UID: req.auth.uid }, {pic: updateData}, {
            new: true,
          })
            .then((updatedProvider) => {
              res.status(200).json(updatedProvider);
            })
            .catch((err) => {
              res.status(500).json({ error: err });
            });
        }
      })
      .catch((err) => {
        res.status(500).json({ error: err });
      });
         } catch (error) {
            return res.status(500).json({ error: 'Failed to update profile picture' });  
        }
    })     
    
  };

  export async function getProvidersForPatients(req, res) {
    const patientUid = req.auth.uid;
  try{
    const patient = await Patient.findOne({UID: patientUid}).populate('Providers');
    
    if (!patient) {
      return res.status(404).json({ message: "patient not found" });
    }
    const providers = patient.Providers;
        res.status(200).json(providers);
      
  }
          catch (err)  {
            console.log(err)
            res.status(500).json({ error: err });
          };
      }



export async function sendOTP(req,res,next){
        try {
          const existingUser = await User.findOne(
            { email: req.body.email },
          );
      
          if (!existingUser) {
            return res.status(400).json({ message: "It seems that you don't have an account, please register instead." });
          }
         await Otp.deleteMany({
            userId : existingUser.UID
      })
          const otp = otpGenerator.generate(6,{
            secret: "TRIAL DEMO",
            digits: 6,
            algorithm: 'sha256',
            epoch: Date.now(),
            upperCaseAlphabets: false, specialChars: false,
            lowerCaseAlphabets: false,
        });
              const otpDocument = new Otp({
                  userId: existingUser.UID, 
                  otp
              });
              await otpDocument.save();
              sendOTPEmail(existingUser,otp)
              res.status(200).json({ message: "OTP Sent"});
      
      } catch (error) {
          console.error('Error generating OTP:', error);
          res.status(500).json({ error: 'Internal Server Error' });
      }
      }

      async function sendOTPEmail(user,otp) {
        let transporter = nodemailer.createTransport({
          host: "smtp-relay.brevo.com",
          port: 587,
          secure: false, // true pour TLS
          auth: {
            user: "azizjaziri87@gmail.com",
            pass: "rGU1MHnABKz5pCQ0",
          },
        });
        const sender = "azizjaziri87@gmail.com"
      
        //definir l'email options 
       const mailOptions = OtpEmailOptions(sender,user,otp);
       
        // Envoyer l'e-mail
        let info = await transporter.sendMail(mailOptions);
      
        console.log("Message sent: %s", info.messageId);
      }

