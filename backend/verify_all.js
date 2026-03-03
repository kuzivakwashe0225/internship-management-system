const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/intrahub').then(async () => {
    await User.updateMany({}, { isVerified: true, verificationToken: undefined });
    console.log('All Users verified');
    process.exit(0);
}).catch(console.error);
