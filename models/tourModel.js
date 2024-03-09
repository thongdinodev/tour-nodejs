const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a name']
    },
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;