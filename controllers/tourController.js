
exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'get all tour'
    })
};

exports.createTour = (req, res, next) => {
    const data = req.body;
    res.status(201).json({
        status: 'success',
        message: {
            data
        }
    })
};

exports.getTour = (req, res) => {
    const idSearch = req.params.id;
    res.status(200).json({
        status: 'success',
        message: 'get only specific tour ' + idSearch
    })
};

exports.updateTour = (req, res) => {
    const idSearch = req.params.id;

    res.status(201).json({
        status: 'success',
        message: 'success update this tour ' + idSearch
    })
};

exports.deleteTour = (req, res) => {
    const idSearch = req.params.id;
    console.log(idSearch);
    res.status(204).json({
        status: 'success',
        message: null
    })
};