const express = require('express');
const router = express.Router();
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

// FOR NESTED GET REVIEW ON TOUR
router.use('/:tourId/reviews', reviewRouter);

// PROTECT ALL ROUTES AFTER THIS MIDDLEWARE
router.use(authController.protect);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour
        )

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.restrictTo('admin', 'lead-guide'),
        tourController.updateTour)
    .delete(
        authController.restrictTo('admin', 'lead-guide'), 
        tourController.deleteTour)


module.exports = router;