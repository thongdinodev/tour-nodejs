const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

// FOR NESTED GET REVIEW ON TOUR
router.use('/:tourId/reviews', reviewRouter);

// PROTECT ALL ROUTES AFTER THIS MIDDLEWARE

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour
        )


router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.updateTour)
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.deleteTour)


router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin);
    // /tours-within?distance=233&center=-40,45&unit=mi
    // /tours-within/233/center/-40,45/unit/mi


router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);


module.exports = router;