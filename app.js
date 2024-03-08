const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes')

dotenv.config({ path: './config.env' });

const app = express();
const port = process.env.PORT

app.use(express.json());
app.use(morgan('dev'));



app.use('/tours', tourRouter);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});