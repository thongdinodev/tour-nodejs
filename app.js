const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = express();
const port = process.env.PORT || 3000;
const databaseURL = process.env.MONGODB_URL;

app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
    console.log(req.headers);
    next();
})

// connect database
mongoose.connect(databaseURL).then(() => console.log('Success connected to MongoDB')).catch((err) => console.log(err));

// USE ROUTES
app.use('/tours', tourRouter);
app.use('/users', userRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});