const Tour = require('../models/tourModel');

exports.getAllTours = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }
    const tours = await Tour.find();
    res.status(200).json({
        status: 'success',
        result: tours.length,
        message: {
            data: tours
        }
    })
};

exports.createTour = async (req, res, next) => {
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: 'success',
            message: {
                data: newTour
            }
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }
    
};

exports.getTour = async (req, res) => {
    try {
        const idSearch = req.params.id;
        const tour = await Tour.findById(idSearch);
        res.status(200).json({
            status: 'success',
            message: {
                data: tour
            }
        });
        
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }

};

exports.updateTour = (req, res) => {
    try {
        const idSearch = req.params.id;
    
        res.status(201).json({
            status: 'success',
            message: 'success update this tour ' + idSearch
        })
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }
};

exports.deleteTour = async (req, res) => {

    try {
        const idSearch = req.params.id;
        await Tour.findByIdAndDelete(idSearch).then((tour) => console.log(tour)).catch((err) => console.log(err))

        res.status(204).json({
            status: 'success',
            message: null
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error
        })
    }
    
};