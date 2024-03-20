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

// for ONE USER ONE REVIEW ON 1 TOUR
reviewSchema.index({ tour: 1, user: 1 }, { unique: true, dropDups: true });

reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: 'tour',
    //     select: 'name duration price '
    // })
    
    this.populate({
        path: 'user',
        select: 'name email'
    });

    next();
});

// STATIC IS POINT TO CURRENT MODEL, INSTANCE METHOD POINT TO DOCUMENT

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating'}
            }
        }
    ]);
    console.log(stats);

    //update tour rating
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        // avoid delete all reviews, set review as default
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewSchema.post('save', function () {
    // to point at the current MODEL
    // this.tour is an inObject
    this.constructor.calcAverageRatings(this.tour);
});

// for findByIdAndUpdate and findByIdAndDelete update data when update, delete
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.r = await this.clone().findOne();
    console.log(this.r);
    next();
  });
  
reviewSchema.post(/^findOneAnd/, async function() {
    // await this.findOne(); does NOT work here, query has already executed
    // this.r.tour must be tourId

    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;