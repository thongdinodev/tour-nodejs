const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const xss = require('xss-clean');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const app = express();

app.use(helmet());

const port = process.env.PORT || 3000;
const databaseURL = process.env.MONGODB_URL;

app.use(express.json());
app.use(morgan('dev'));
app.use((req, res, next) => {
    console.log(req.headers);
    next();
});

// limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour' 
});
app.use('/', limiter);

// body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// data sanitization against NoSQL query injection, reject: {$gte}
app.use(mongoSanitize());

// data sanitazation, convert special char to normal char
app.use(xss());

// protect from pollute query
app.use(hpp({
    whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
    ]
}));


// connect database
mongoose.connect(databaseURL).then(() => console.log('Success connected to MongoDB')).catch((err) => console.log(err));

// USE ROUTES
app.use('/tours', tourRouter);
app.use('/users', userRouter);
app.use('/reviews', reviewRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});