const multer = require('multer');
const sharp = require('sharp');

const Tour = require('../models/tourModel');
const factory = require('../controllers/handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appErrors');

// MULTER CONFIG

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not and image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
]);

// FACTORY ROUTES
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
exports.createTour = factory.createOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.updateTour = catchAsync(async (req, res, next) => {
  if (!req.files.imageCover && !req.files.images) return next();
  
  // 1) Cover image
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`

  await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);
  
  // 2) Images
  req.body.images = [];

  await Promise.all(
      req.files.images.map(async (file, index) => {
          const filename = `tour-${req.params.id}-${Date.now()}-${index + 1}.jpeg`;

          await sharp(file.buffer)
              .resize(2000, 1333)
              .toFormat('jpeg')
              .jpeg({quality: 90 })
              .toFile(`public/img/tours/${filename}`);

          req.body.images.push(filename);
      })
  );

  console.log(req.body);
  // END HANDLER IMAGE
  
  const doc = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
  });

  if (!doc) {
      return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
      status: 'success',
      data: {
          data: doc
      }
  });
});

exports.getToursWithin = catchAsync(async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
        next( new AppError('Please provide latitude and longtitude in the format lat,lng', 400));
    };

    console.log(distance, lat, lng, unit);

    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
});