const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review can not be empty']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'tour',
        select: 'name duration price '
    }).populate({
        path: 'user',
        select: 'name email'
    });

    next();
});

// static point at MODEL, instance method point at DOCUMENT
reviewSchema.statics.calcAvgRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);
    console.log(stats);
    // update document
    await Tour.findByIdAndUpdate(tourId, {
        ratingsQuantity: stats[0].nRating,
        ratingsAverage: stats[0].avgRating
    });
};

reviewSchema.post('save', function() {
    this.constructor.calcAvgRatings(this.tour)
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;