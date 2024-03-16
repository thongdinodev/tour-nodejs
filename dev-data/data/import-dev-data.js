const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env'})

console.log(process.env.PORT);

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log('Connect to DB successfully');
}).catch((err) => {
    console.log(err);
});

// read json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));

// import data into db
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded!');
        process.exit();
    } catch (error) {
        console.log(error);
    }
};

// delete all data from db
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
        process.exit();

    } catch (error) {
        console.log(error);
    }
}

if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}