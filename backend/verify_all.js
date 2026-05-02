require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function verifyAll() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const result = await User.updateMany(
            { isVerified: false },
            { 
                isVerified: true, 
                otpCode: undefined, 
                otpExpires: undefined 
            }
        );

        console.log(`Successfully verified ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

verifyAll();
