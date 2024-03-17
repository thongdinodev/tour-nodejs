const Tour = require('../models/tourModel');
const factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');

exports.getAllTours = catchAsync(async (req, res, next) => {
    const tours = await Tour.find();
    res.status(200).json({
        status: 'success',
        result: tours.length,
        message: {
            data: tours
        }
    })
});


exports.getTour = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.id).populate('reviews');
    // Tour.findOne({ _id: req.params.id })
  
    if (!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
});


// FACTORY ROUTES
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);