exports.getOverview = (req, res, next) => {
    res.status(200).render('overview', {
        title: 'All tour Page',
        tour: 'This is all tour page'
    });
};

exports.getTour = (req, res, next) => {
    res.status(200).render('tour', {
        title: 'Detail tour',
        tour: 'This is a detail tour page'
    });
};