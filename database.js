import mongoose from 'mongoose';
import dotenv from 'dotenv';

//connexiondatabase


const connectToDatabase = async () => {
  try {
    const mongoURI = process.env.DB_URL;

    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB Atlas GluMate');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

export default connectToDatabase;