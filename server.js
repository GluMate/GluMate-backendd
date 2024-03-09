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
mongoose.set('debug',true);

mongoose.Promise = global.Promise;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const hostname = '127.0.0.1' || process.env.HOST
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
  process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down gracefully.');
    app.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });