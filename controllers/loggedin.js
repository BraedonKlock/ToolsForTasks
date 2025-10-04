/**
 * This file is responsible for handling post and get requests 
 */

const Jobs = require('../models/jobs'); // importing jobs object from models
const Employees = require('../models/employee');
const db = require('../util/database');
const bcrypt = require('bcryptjs'); // importing encryption for user passwords

/**-------------------------------------------------GET INDEX------------------------------------------------------- */
/**Rendering the home page for logged in users */
exports.getIndex = (req,res,next) => {
  const role = req.session.role;

  const loginID = req.session.loginid;
  const name = req.session.companyname;
  const employeename = req.session.employeename;


  Jobs.getAllJobs(loginID, role).then(([rows]) => { // getting all jobs from database by destructuring the 2d arrays first index
      res.render('home/index', {
          jobs: rows, // passing in rows with jobs keyword
          pageTitle: 'Tools for Tasks - Home',
          path: '/loggedin',
          companyname: name,
          employeename
      });
  })
};

/**-------------------------------------------------GET JOBS PAGE--------------------------------------------------- */
/**Rendering jobs page for when jobs is choosen in hamburger menu */
exports.jobsPage = (req,res,next) => {
  const loginID = req.session.loginid;
  const role = req.session.role;
  const orgid = req.session.org;
  const name = req.session.companyname;
  const employeeName = req.session.employeename;
  const error = req.query.error || null;

  Promise.all([
    Jobs.getAllJobs(loginID, role),
    Employees.getAllByOrg(orgid)
  ])
  .then(([jobsResult, employeesResult]) => {
    const [jobs] = jobsResult;
      const [employees] = employeesResult;
      
      res.render('jobs', {
        jobs: jobs,
        employees: employees,
        pageTitle: 'Tools for Tasks - Jobs',
        path: '/loggedin',
        companyname: name,
        employeename: employeeName,
        error
      });
    })
    .catch(err => next(err));
  };

/**-------------------------------------------------POST ADDJOB----------------------------------------------------- */
/**Handling post request for when a user adds a new job in the jobs page */
exports.postAddJob = (req,res,next) => {
  const { jobType, jobid, title, date, address, phoneNumber, notes } = req.body; // req.body job inputs
  const orgid = req.session.loginid;
  const orgsess = req.session.org;
  const raw = req.body.employees; // employeee input. using this because one employee added returns a string
  //if raw is array (more than one employee added) then we leave it, if it isn't an array and isnt a truthy value then we turn it into an array
  const emails = Array.isArray(raw) ? raw : raw ? [raw] : [];
  
  const job = new Jobs(jobType, jobid, title, date, address, phoneNumber, notes, orgid);

  let assignedEmpIds = []; // used for storing....
  
  let jobDbId = null;
  

  // check duplicate jobid set by the owner. if yes return 
  db.execute('SELECT * FROM jobs WHERE org_id = ? AND jobid = ?', [orgid, jobid]).then(([rows]) => {
    if(rows.length > 0) {
      return res.redirect('/loggedin/jobs?error=Job was not added! Jobid already exists for this organization');
    }

  // saving job to database first to then get database job ID
  return job.save()
  .then(() => Jobs.findDbIdByJobid(orgid, jobid)) // finding jobs databse ID
  .then((foundJobId) => { // saving result in foundJobId
    jobDbId = foundJobId; // storing result in jobDBId
    if (!jobDbId) throw new Error('Job DB id not found after insert');
    
    if (!emails.length) return [];  // if aray is empty
    return Employees.findDbIdsByEmails(orgid, emails); // returning employees database ID's
  })
  .then((employeeDbIds) => {
    const ids = (employeeDbIds || []).map(Number).filter(Boolean);
    assignedEmpIds = ids; // used for storing employee db ids to add newly added job through socketio
    if (!ids.length) return null;
    return Jobs.assignEmployees(jobDbId, ids);
  }).then(()=> { // SQL query to be able to perform socketio
    return db.execute('SELECT * FROM jobs WHERE org_id = ? AND jobid = ? LIMIT 1', [orgid, jobid]);
  }).then(([rows]) => { // get newly added job
    if (!rows || rows.length === 0) {
      throw new Error('Inserted job not found for broadcast');
    }    
    const newJob = rows[0]; // newly added job assigned to a variable
    
    // pasing the newly added job into .emit to render in jobs page (jobs.ejs) to owners
    req.app.get('io')
    .to(`org:${orgsess}`)
    .emit('job:created', {
      jobType: newJob.jobType,
      jobid: newJob.jobid,
      title: newJob.title,
      date: newJob.date,       
      address: newJob.address,
      phoneNumber: newJob.phoneNumber,
      notes:newJob.notes
    });

    // passing the newly added job into .emit to render in home page (index.ejs) to owners
    req.app.get('io')
    .to(`org:${orgsess}`)
    .emit('job:created-index', {
      jobType: newJob.jobType,
      jobid: newJob.jobid,
      title: newJob.title,
      date: newJob.date,   
      address: newJob.address,
      phoneNumber: newJob.phoneNumber,
      notes:newJob.notes
    });
    
    // passing the newly added job into .emit to render in home page (index.ejs) to epmloyees (crew && manager)
    if (assignedEmpIds.length) {
      assignedEmpIds.forEach(empId => {
        req.app.get('io')
        .to(`emp:${empId}`)
        .emit('job:created-index', {
          jobType: newJob.jobType,
          jobid: newJob.jobid,
          title: newJob.title,
          date: newJob.date,       
          address: newJob.address,
          phoneNumber: newJob.phoneNumber,
          notes:newJob.notes        
        });
        // adding assigned job to employees job page
        req.app.get('io')
        .to(`emp:${empId}`)
        .emit('job:created', {
          jobType: newJob.jobType,
          jobid: newJob.jobid,
          title: newJob.title,
          date: newJob.date,       
          address: newJob.address,
          phoneNumber: newJob.phoneNumber,
          notes:newJob.notes
        });
      });
    }
  })
  .then(() => res.redirect('/loggedin/jobs')) // redirecting user back to jobs page
   })
  .catch(next);
  };
/**------------------------------------------------GET EDIT JOB PAGE---------------------------------------------------- */
exports.editJobPage = (req, res, next) => {
  const orgid = req.session.org;
  const companyname = req.session.companyname;
  const employeename = req.session.employeename;
  const { id: publicJobId } = req.params;

  let job;
  let employeesForJob = [];   // employees assigned to this job
  let allEmployees = [];      // all employees in the org

  return Jobs.findDbIdByJobid(orgid, publicJobId)
    .then((dbJobId) => {
      if (!dbJobId) {
        return res.status(404).render('404', { pageTitle: 'Job not found' });
      }
      // in parallel: get job_employees refs, job row, and all org employees
      return Promise.all([
        Employees.findEmployeesforJob(dbJobId), // -> [refRows, fields]
        Jobs.findJobById(orgid, publicJobId),   // -> [jobRows, fields]
        Employees.getAllByOrg(orgid)            // -> [allRows, fields]
      ]);
    })
    .then(([[refRows], [jobRows], [allRows]]) => {
      if (!jobRows || !jobRows.length) {
        return res.status(404).render('404', { pageTitle: 'Job not found' });
      }

      job = jobRows[0];
      allEmployees = allRows || [];

      const ids = (refRows || []).map(r => r.employee_id);
      if (!ids.length) return []; // no employees on this job

      // fetch each assigned employee by id in parallel
      return Promise.all(ids.map(empId => Employees.findEmployeeById(orgid, empId)));
    })
    .then((empResults) => {
      if (Array.isArray(empResults) && empResults.length) {
        employeesForJob = empResults
          .map(([rows]) => rows && rows[0])
          .filter(Boolean);
      }

      return res.render('editJobPage', {
        pageTitle: 'Tools for Tasks - Edit Job',
        path: '/loggedin',
        companyname,
        employeename,
        employees: employeesForJob,  // employees attached to this job
        allEmployees,                // all employees in the org
        job
      });
    })
    .catch(next);
};
/**---------------------------------------POST REMOVE EMPLOYEE FROM JOB--------------------------------------------- */

exports.removeEmployeeFromJob = (req, res, next) => {
  const orgid = req.session.org;
  const { jobid, empid } = req.params;  // empid here = employer-set employeeid

  let dbJobId;

  Jobs.findDbIdByJobid(orgid, jobid)
    .then((foundJobId) => {
      console.log(foundJobId);
      if (!foundJobId) return res.status(404).json({ ok: false, error: 'Job not found' });
      dbJobId = foundJobId;
      return Employees.findDbIdByEmployeeid(orgid, empid);
    })
    .then((dbEmpId) => {
      console.log(dbEmpId);
      if (!dbEmpId) return res.status(404).json({ ok: false, error: 'Employee not found' });
      return Jobs.removeEmployeeFromJob(dbJobId, dbEmpId);
    })
    .then(() => res.json({ ok: true }))
    .catch(next);
};


/**-------------------------------------------------POST EDIT JOB----------------------------------------------------- */
exports.postEditJob = (req, res, next) => {
  const { jobType, jobid: newJobid, title, date, address, phoneNumber, notes } = req.body;
  const orgid = req.session.org;
  const jobid = req.params.id;   // DB PK

  const raw = req.body.employees; // 'employees[]' from form
  const emails = Array.isArray(raw) ? raw : raw ? [raw] : [];
  let assignedEmpIds = [];
  const job = new Jobs(jobType, newJobid, title, date, address, phoneNumber, notes, orgid);

return job.update(jobid)
  .then(() => {
    if (!emails.length) return [];
    return Employees.findDbIdsByEmails(orgid, emails);
  })
  .then((result) => {
    const rows = Array.isArray(result) && Array.isArray(result[0]) ? result[0] : result;
    const ids = (rows || [])
      .map(r => (typeof r === 'object' && r !== null ? Number(r.id) : Number(r)))
      .filter(n => Number.isFinite(n));
    assignedEmpIds = ids;

    if (!ids.length) return null;
    return Jobs.assignEmployees(jobid, ids);
  }).then(()=> { // SQL query to be able to perform socketio
    return db.execute('SELECT * FROM jobs WHERE org_id = ? AND id = ? LIMIT 1', [orgid, jobid]);
  }).then(([rows]) => { // get newly added job
    if (!rows || rows.length === 0) {
      throw new Error('Inserted job not found for broadcast');
    }    
    const newJob = rows[0]; // newly added job assigned to a variable

    // passing the newly added job into .emit to render in home page (index.ejs) to epmloyees (crew && manager)
    if (assignedEmpIds.length) {
      assignedEmpIds.forEach(empId => {
        req.app.get('io')
        .to(`emp:${empId}`)
        .emit('job:created-index', {
          jobType: newJob.jobType,
          jobid: newJob.jobid,
          title: newJob.title,
          date: newJob.date,       
          address: newJob.address,
          phoneNumber: newJob.phoneNumber,
          notes:newJob.notes        
        });
        // adding assigned job to employees job page
        req.app.get('io')
        .to(`emp:${empId}`)
        .emit('job:created', {
          jobType: newJob.jobType,
          jobid: newJob.jobid,
          title: newJob.title,
          date: newJob.date,       
          address: newJob.address,
          phoneNumber: newJob.phoneNumber,
          notes:newJob.notes
        });
      });
    }
  })
  .then(() => res.redirect('/loggedin/jobs')) // redirecting user back to jobs page
  .catch(next);
  };

/**---------------------------------------------DELETE DELETE JOB--------------------------------------------------- */
exports.deleteJob = (req,res,next) => {
  const { id } = req.params; //JOBID is passed in the URL as a param so im getting that to be able to find the job

  const orgid = req.session.org; // getting the orginization id for all users
  const jobEmployees = []; //initializing an array to store the employee db ids that are associated with the deleted job

Jobs.findDbIdByJobid(orgid, id) // finding the db id for the deleted job
  .then((foundJobId) => { // db id stored in variable
    if (!foundJobId) throw new Error('Job not found');

    return Employees.findEmployeesforJob(foundJobId); //finding employee db ids that are associated with the deleted job
  })
  .then(([rows]) => { // employees saved in rows

    const jobEmployees = rows.map(r => r.employee_id);

    return Jobs.deleteJobById(orgid, id).then(() => jobEmployees); // deleting the job then returns the jobEmployees array
  })
  .then((jobEmployees) => {
    // deleteing the job for owners in index.ejs and jobs.ejs
    const io = req.app.get('io');
    io.to(`org:${orgid}`).emit('job:delete-jobs', { id });

    //deleting the job for employees in index.ejs and jobs.ejs
    jobEmployees.forEach(empId => {
      io.to(`emp:${empId}`).emit('job:delete-jobs', { id });
    });

    res.redirect('/loggedin/jobs'); // redirecting back to jobs.ejs
  })
  .catch(next);
};

/**-----------------------------------------------GET JOBS DETAILS-------------------------------------------------- */
/** Rendering the job details page where a user goes when they click on a job in the logged in home page */
exports.jobDetailsPage = (req,res,next) => {
  const role = req.session.role;
  
  const orgId = req.session.org;
  const name = req.session.companyname;
  const employeeName = req.session.employeename;
  const { id } = req.params; // getting the id from the url params which was added when a user selects a job

  Jobs.findJobById(orgId, id)
  // finding the job in the database by its unique job id
  .then(([rows]) => { // returns a promise which is a 2d array. getting the firat index where the job details are stored
    if (!rows || rows.length === 0) { // if unsuccessful
      return res.status(404).render('404', { pageTitle: 'Job Not Found' });
    }
    const job = rows[0] // storing the job object in job
    res.render('jobDetails', { // rendering the job details page
      pageTitle: 'Tools for Tasks - Job Details',
      path: '/loggedin',
      job, // passing the job in 
      companyname: name,
      employeename: employeeName 
    });
  })
  .catch(next);
};

/**---------------------------------------------GET MANAGE EMPLOYEES------------------------------------------------ */
exports.manageEmployees = (req,res,next) => {
  const companyName = req.session.companyname;
  const role = req.session.role;
  const orgid = req.session.org;

  Employees.getAllByOrg(orgid).then(([rows]) => {
    const employees = rows;
    const managers = [];
    const crew = [];

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];
      if (employee.role === "manager") {
        managers.push(employee);
      } else {
        crew.push(employee);
      }
    }
    res.render('manageEmployees', {
      pageTitle: "Tools for Tasks - Manage Employees",
      path:'/loggedin',
      companyname: companyName,
      managers,
      crew
    });
  });
} 

/**---------------------------------------------EDIT EMPLOYEE PAGE-------------------------------------------------- */
exports.editEmployeePage = (req,res,next) => {
  const companyName = req.session.companyname;
  const { id } = req.params;
  const orgid = req.session.org;

  Employees.findEmployeeById(orgid, id).then(([rows]) => {
    const employee = rows[0];

    res.render('editEmployeePage', {
      pageTitle: "Tools for Tasks - Edit Employee",
      path: '/loggedin',
      companyname: companyName,
      employee
    });
  });
}

/**----------------------------------------------POST EDIT EMPLOYEE------------------------------------------------- */
exports.postEditEmployee = (req,res,next) => {
  const { id } = req.params;
  const orgid = req.session.org;


  const employeeid = req.body.employeeid;
  const name = req.body.name;
  const role = req.body.role;
  const email = req.body.email;

  Employees.updateEmployee(id,employeeid,name,role,email,orgid)
  .then(() => {
    res.redirect('/loggedin/manageEmployees')})
    .catch(next);
  };

/**-------------------------------------------------ADD EMPLOYEE---------------------------------------------------- */
exports.addEmployee = (req,res,next) => {
  const companyName = req.session.companyname;
  
  res.render('addEmployeePage', {
      pageTitle: "Tools for Tasks - Edit Employee",
      path: '/loggedin',
      companyname: companyName,    
  });
};

/**-----------------------------------------------POST ADD EMPLOYEE------------------------------------------------- */
exports.postAddEmployee = (req,res,next) => {
  const employeeid = req.body.employeeid;
  const name = req.body.name;
  const role = req.body.role;
  const email = req.body.email;
  const password = req.body.password;

  const orgid = req.session.org;

  bcrypt.hash(password,12)
  .then((hashedPassword) => {
      const employee = new Employees(name,role,employeeid,email,hashedPassword,orgid);
      return employee.save(); 
    })
    .then(() => {
      res.redirect('/loggedin/manageEmployees');
    })
    .catch(next);
};

/**-------------------------------------------------POST LOGOUT----------------------------------------------------- */
/** Hnadling post request when a user logouts */
exports.postLogout = (req,res,next) => {
    req.session.destroy(err => { // destroying session
        if (err) {
            return res.redirect('/loggedin');
        }
        res.clearCookie('tft.sid'); // clearing cookie
        res.redirect('/login'); // redirecting to login page
    });
};