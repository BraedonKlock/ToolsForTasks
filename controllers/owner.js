const Jobs = require('../models/jobs');

exports.getIndex = (req,res,next) => {
    Jobs.getAllJobs().then(([rows]) => {
        res.render('home/index', {
            jobs: rows,
            pageTitle: 'Tools for Tasks - Home',
            path: '/owner',
        });
    })
};

exports.jobsPage = (req,res,next) => {
    Jobs.getAllJobs().then(([rows]) => {
        res.render('jobs', {
            jobs: rows,
            pageTitle: 'Tools for Tasks - Jobs',
            path: '/owner',
        });
    })
};

exports.postAddJob = (req,res,next) => {
    const jobType = req.body.jobType;
    const id = req.body.id;
    const title = req.body.title;
    const date = req.body.date;
    const address = req.body.address;
    const phoneNumber = req.body.phoneNumber
    const notes = req.body.notes;

    const Job = new Jobs(jobType,id,title,date,address,phoneNumber,notes);
    Job.save().then(() => {
        res.redirect('/owner/jobs');
    })
    .catch(next);
};

exports.jobDetailsPage = (req,res,next) => {
    const { id } = req.params;
    Jobs.findJobById(id)
    .then(([rows]) => { 
        if (!rows || rows.length === 0) {
        return res.status(404).render('404', { pageTitle: 'Job Not Found' });
        }
        const job = rows[0]
        res.render('jobDetails', {
            pageTitle: 'Tools for Tasks - Job Details',
            path: '/owner',
            job
        });
    })
    .catch(next);
};