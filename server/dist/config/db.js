import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
let isConnected = false;
export const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        isConnected = true;
        return true;
    }
    const uri = process.env.MONGODB_URI || 'mongodb+srv://singhmp120599_db_user:aW8W6xXVphkiAE47@cluster0.i97cms3.mongodb.net/gr_enterprises?retryWrites=true&w=majority&appName=Cluster0';
    try {
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,
        });
        isConnected = true;
        console.log(`✅ [MongoDB] Connected successfully to host: ${conn.connection.host}`);
        console.log(`📦 [MongoDB] Database: ${conn.connection.name}`);
        return true;
    }
    catch (error) {
        isConnected = false;
        console.error(`❌ [MongoDB] Connection Failed: ${error.message}`);
        console.log(`ℹ️ [MongoDB Tip] If using MongoDB Atlas, check your IP whitelist (Network Access) and connection string in server/.env`);
        return false;
    }
};
export const getDBStatus = () => {
    return {
        connected: isConnected,
        readyState: mongoose.connection.readyState, // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        database: mongoose.connection.name || 'Not Connected',
        host: mongoose.connection.host || 'None'
    };
};
