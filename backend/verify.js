const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://127.0.0.1:27017/intrahub').then(async () => {
    await User.updateOne({ email: 'alice@hit.ac.zw' }, { isVerified: true, verificationToken: undefined });
    console.log('User verified');
    process.exit(0);
}).catch(console.error);
