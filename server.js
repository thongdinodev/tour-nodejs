const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const port = process.env.PORT || 3000;
const databaseURL = process.env.MONGODB_URL;

dotenv.config({ path: './config.env'})

mongoose.connect(databaseURL, {
    autoIndex: true
}).then(() => {
    console.log('Connect to DB successfully');
}).catch((err) => {
    console.log(err);
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});