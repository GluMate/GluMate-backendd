import Provider from "../models/provider.js";
import User from "../models/user.js";
import admin from "firebase-admin"
import {validationResult} from "express-validator"
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import Patient from "../models/patient.js";
import { WelcomeEmailOptions } from "../utils/welcomEmail-template.js";
import uploadDiplomas from "../middlewears/multer-diploma.js";
//import { recognizeText } from "../controllers/ocr.js";

export async function providerRegister(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
  
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "It seems that you already have an account" });
        }
        // Create a new provider object
        const provider = new Provider({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            phone: req.body.phone,
            email: req.body.email,
            role: "Provider",
        });
  
        // Save the patient to MongoDB
        let savedProvider;
        try {
            savedProvider = await provider.save();
        } catch (error) {
            console.log('Error saving provider to MongoDB:', error);
            return res.status(500).send(error);
        }
  
        let userRecord;
        try {
            userRecord = await admin.auth().createUser({
                email: req.body.email,
                password: req.body.password
            });
            await admin.auth().setCustomUserClaims(userRecord.uid, {
              role: 'provider' // Set the user's role 
          });
        } catch (error) {
            console.log('Error creating user in Firebase:', error);
            // If Firebase registration fails, delete the patient record from MongoDB
            try {
                await savedProvider.delete();
            } catch (deleteError) {
                console.log('Error deleting patient from MongoDB:', deleteError);
            }
            return res.status(500).send(error);
        }
  
        // Update the patient document with the UID from Firebase
        savedProvider.UID = userRecord.uid;
        await savedProvider.save();

       try{
        await sendWelcomeEmail(savedProvider);
   
       res.status(200).json(savedProvider); // sucess with valid email
       }catch (e){
          console.log('Error in sending welcome email')
        
       res.status(202).json(savedProvider); // success with error sending email
       }
    } catch (error) {
        console.log('Error in providerRegister:', error);
        res.status(500).send(error);
    }
  }
  

async function sendWelcomeEmail(user) {
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
 const mailOptions = WelcomeEmailOptions(sender,user);
 
  // Envoyer l'e-mail
  let info = await transporter.sendMail(mailOptions);

  console.log("Message sent: %s", info.messageId);
}




export async function getPatientsForProvider(req, res) {
    const providerUid = req.auth.uid;
  try{
    const provider = await Provider.findOne({UID: providerUid}).populate('Patients');
    
    if (!provider) {
      return res.status(404).json({ message: "Care Provider not found" });
    }
    const patients = provider.Patients;
        res.status(200).json(patients);
      
  }
          catch (err)  {
            console.log(err)
            res.status(500).json({ error: err });
          };
      }
    
  

  export function updateUser(req, res) {
    if (!req.auth || !req.auth.uid) {
      return res.status(400).json({ error: "Invalid user ID" });
    }
  
    const updateData = req.body;
    User.findOne({ UID: req.auth.uid })
      .then((user) => {
        if (user.role === "Patient") {
          User.findOneAndUpdate({ UID: req.auth.uid }, updateData, {
            new: true,
          })
            .then((updatedPatient) => {
              res.status(200).json(updatedPatient);
            })
            .catch((err) => {
              res.status(500).json({ error: err });
            });
        } else if (user.role === "Provider") {
          Provider.findOneAndUpdate({ UID: req.auth.uid }, updateData, {
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
  }

  export  async function DiplomasUpload (req,res,next){
      uploadDiplomas.array('diplomas',5)(req, res,async (err) => {
      if (err) {   
        return res.status(500).json({ error: err.message }); 
      } 
      
      try {         
        if (!req.auth || !req.auth.uid) {
            return res.status(400).json({ error: "Invalid user ID" });
          }
      const updateData = req.files.map(file => file.path);
     
          Provider.findOneAndUpdate({ UID: req.auth.uid }, { 
            $addToSet: { // Add to array without duplicates
              'diplomaVerification.verificationDocuments': { $each: updateData }
            }
          }, {
              new: true,
            }        
         )
            .then((updatedProvider) => {
              res.status(200).json(updatedProvider);
            })
            .catch((err) => {
              res.status(500).json({ error: err });
            });
        
         } catch (error) {
            return res.status(500).json({ error: 'Failed to update diplomas' });  
        }
    })     
    
  };

  // export function assignProviderToPatient(req, res) {
  //   const patientId = req.auth.userId;
  //   const providerId = req.params.providerId;
  
  //   // Vérifier si le patient existe
  //   Patient.findById(patientId)
  //     .then((patient) => {
  //       if (!patient) {
  //         return res.status(404).json({ message: "Patient non trouvé." });
  //       }
  
  //       // Mettre à jour l'attribut 'doctor' du patient avec l'ID du docteur
  //       patient.provider = providerId;
  //       return patient.save();
  //     })
  //     .then((updatedPatient) => {
  //       res.status(200).json(updatedPatient);
  //     })
  //     .catch((err) => {
  //       res.status(400).json(err);
  //     });
  // }