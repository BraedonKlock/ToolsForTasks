exports.getIndex = (req,res,next) => {
    res.render('home/index', {
        pageTitle: 'Tools for Tasks - Home',
        path: '/crew'
    });
}

exports.jobsPage = (req,res,next) => {
    res.render('jobs', {
        pageTitle: 'Tools for Tasks - Jobs',
        path: '/crew'
    });
}