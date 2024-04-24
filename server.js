import mongoose from "mongoose";
import dotenv from "dotenv";
import express from "express";
import connectToDatabase from "./database.js";
import cors from "cors" ;
import morgan from "morgan";
import path, { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import userRoutes from './routes/user.js'
import providerRoutes from './routes/provider.js'
import glucRoutes from './routes/glucose.js' ;
import admin from 'firebase-admin'
import User from "./models/user.js";

import Glucose from "./models/glucose.js"
mongoose.set('debug',true);

mongoose.Promise = global.Promise;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const hostname = '0.0.0.0' || process.env.HOST
const app =express();
const port = process.env.port || 9090
const databaseName = 'GluMate';


admin.initializeApp({
  credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS)
});

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use("/img", express.static("uploads"));
app.use('/user',userRoutes);
app.use('/provider',providerRoutes);
app.use('/glucose',glucRoutes);
// Se connecter à MongoDB
// mongoose
//   .connect(`mongodb://127.0.0.1:27017/${databaseName}`)
//   .then(() => {
//     // Une fois connecté, afficher un message de réussite sur la console
//     console.log(`Connected to ${databaseName}`);
//   })
//   .catch(err => {
//     // Si quelque chose ne va pas, afficher l'erreur sur la console
//     console.log(err);
//   });


/**
 * Démarrer le serveur à l'écoute des connexions
 */
app.listen(port, hostname,() => {
  console.log(`Server running at http://${hostname}:${port}/`);

})
app.get('/uploads/:folder/:filename',(req,res)=> {
  const {filename , folder} = req.params;
 
  const iamgePath = (path.join(__dirname, 'uploads', folder , filename));
  fs.access(iamgePath , fs.constants.F_OK, (err) => {
    if (err) {
      res.status(404).send('File not found')
      console.log(iamgePath)
    } else {
      res.sendFile(iamgePath)
    }
  })
  
})

app.get('/',(req,res) => {
  res.status(200).send('GluMate API')
})


connectToDatabase() ;
const userId = "660c30c4145142dfd625f9a9"; // User ID for type 1 diabetes

const startDate = new Date("2024-01-15T00:00:00"); // Start date for measurements
const endDate = new Date("2024-04-15T00:00:00"); // End date for measurements

const frequency = 5; // Measurement frequency in minutes
const measurementsPerDay = 100; // Number of measurements per day

const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));

const generateRandomGlucose = () => {
  // Generate logical glucose values for type 1 diabetes
  // You can adjust the range based on your requirements
  const minGlucose = 60;
  const maxGlucose = 300;
  return Math.floor(Math.random() * (maxGlucose - minGlucose + 1)) + minGlucose;
};

const addMeasurements = async () => {
  for (let day = 0; day < totalDays; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);
    for (let minute = 0; minute < 24 * 60; minute += frequency) {
      const measuredAt = new Date(currentDate);
      measuredAt.setMinutes(measuredAt.getMinutes() + minute);
      const glucoseValue = generateRandomGlucose();
      const glucoseMeasurement = new Glucose({
        measured_at: measuredAt,
        gluc: glucoseValue,
        metadata: {
          userId: userId,
          note: "fasting", // You can change note based on your requirement
          type: "device", // Assuming measurements are from a device
          unit: "mg/dL", // Unit for glucose measurements
        },
      });
      try {
        await glucoseMeasurement.save();
      } catch (error) {
        console.error("Error saving glucose measurement:", error);
      }
    }
  }
  console.log("Glucose measurements added successfully!");
};

//addMeasurements();
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully.');
    app.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });