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

  return Jobs.getAllJobs(loginID, role).then(([rows]) => { // getting all jobs from database by destructuring the 2d arrays first index
      res.status(200).render('home/index', {
          jobs: rows, // passing in rows with jobs keyword
          pageTitle: 'Tools for Tasks - Home',
          path: '/loggedin',
          companyname: name,
          employeename
      });
  })
  .catch(() => {
    res.status(500).render('error', {
      pageTitle: 'Server Error',
      path: '/loggedin',
      companyname: name,
      employeename,
      message: 'Something went wrong while loading jobs.'
    });
  });
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
      
      res.status(200).render('jobs', {
        jobs: jobs,
        employees: employees,
        pageTitle: 'Tools for Tasks - Jobs',
        path: '/loggedin',
        companyname: name,
        employeename: employeeName,
        error
      });
    })
    .catch(() => {
      res.status(500).render('error', {
        pageTitle: 'Server Error',
        path: '/loggedin',
        companyname: name,
        employeename: employeeName,
        message: 'Something went wrong while loading jobs.'
      });
    });
  };

/**-------------------------------------------------POST ADDJOB----------------------------------------------------- */
/**Handling post request for when a user adds a new job in the jobs page */
exports.postAddJob = (req,res,next) => {
  const { jobType, jobid, title, date, address, phoneNumber, notes } = req.body; // req.body job inputs
  const orgid = req.session.loginid;
  const orgsess = req.session.org;
  const name = req.session.companyname;
  const employeeName = req.session.employeename;
  const raw = req.body.employees; // employeee input. using this because one employee added returns a string
  //if raw is array (more than one employee added) then we leave it, if it isn't an array and isnt a truthy value then we turn it into an array
  const emails = Array.isArray(raw) ? raw : raw ? [raw] : [];
  
  const job = new Jobs(jobType, jobid, title, date, address, phoneNumber, notes, orgid);

  let assignedEmpIds = []; // used for storing....
  
  let jobDbId = null;
  

  // check duplicate jobid set by the owner. if yes return 
  db.execute('SELECT * FROM jobs WHERE org_id = ? AND jobid = ?', [orgid, jobid]).then(([rows]) => {
    if(rows.length > 0) {
      return res.status(409).redirect('/loggedin/jobs?error=Job was not added! Jobid already exists for this organization');
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
      throw new Error('Inserted job not found');
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
  .then(() => res.redirect(303,'/loggedin/jobs')) // redirecting user back to jobs page
   })
    .catch(() => {
      res.status(500).render('error', {
        pageTitle: 'Server Error',
        path: '/loggedin',
        companyname: name,
        employeename: employeeName,
        message: err.message || 'Something went wrong while adding the job.'
      });
    });
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
        return res.status(404).render('error', {
          pageTitle: 'Job not found',
          path: '/loggedin',
          companyname,
          employeename,
          message: 'Could not load job'
        });
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
        return res.status(404).render('error', { 
          pageTitle: 'Job not found',
          path: '/loggedin',
          companyname,
          employeename,
          message: 'Could not find job'
        });
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

      return res.status(200).render('editJobPage', {
        pageTitle: 'Tools for Tasks - Edit Job',
        path: '/loggedin',
        companyname,
        employeename,
        employees: employeesForJob,  // employees attached to this job
        allEmployees,                // all employees in the org
        job
      });
    })
    .catch(() => {
      res.status(500).render('error', {
        pageTitle: 'Server Error',
        path: '/loggedin',
        companyname,
        employeename,
        message: 'Something went wrong while displaying the job.'
      });
    });
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
  const companyname = req.session.companyname;
  const employeename = req.session.employeename;

  const raw = req.body.employees; // 'employees[]' from form
  const emails = Array.isArray(raw) ? raw : raw ? [raw] : [];
  let assignedEmpIds = [];
  const job = new Jobs(jobType, newJobid, title, date, address, phoneNumber, notes, orgid);

  // check duplicate jobid set by the owner. if yes return 
  db.execute('SELECT * FROM jobs WHERE org_id = ? AND jobid = ? AND id != ?', [orgid, newJobid, jobid]).then(([rows]) => {
    if(rows.length >= 1 && jobid != newJobid) {
      return res.redirect(303,'/loggedin/jobs?error=Job was not updated! Jobid already exists for this organization');
    }
    

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
        throw new Error('Inserted job not found');
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
    .then(() => res.redirect(303,'/loggedin/jobs')) // redirecting user back to jobs page
    })
    .catch(() => {
      res.status(500).render('error', {
        pageTitle: 'Server Error',
        path: '/loggedin',
        companyname,
        employeename,
        message: err.message || 'Something went wrong while updating the job.'
      });
    });
  };

/**---------------------------------------------DELETE DELETE JOB--------------------------------------------------- */
exports.deleteJob = (req,res,next) => {
  const { id } = req.params; //JOBID is passed in the URL as a param so im getting that to be able to find the job
  const companyname = req.session.companyname;
  const employeename = req.session.employeename;
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

    res.redirect(303,'/loggedin/jobs'); // redirecting back to jobs.ejs
  })
    .catch(() => {
      res.status(500).render('error', {
        pageTitle: 'Server Error',
        path: '/loggedin',
        companyname,
        employeename,
        message: err.mesage || 'Something went wrong while deleting the job.'
      });
    });
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
      return res.status(404).render('error', { 
        pageTitle: 'Job not found',
        path: '/loggedin',
        companyname: name,
        employeename: employeeName,
        message: 'Could not find job'
      });
    }
    const job = rows[0] // storing the job object in job
    res.status(200).render('jobDetails', { // rendering the job details page
      pageTitle: 'Tools for Tasks - Job Details',
      path: '/loggedin',
      job, // passing the job in 
      companyname: name,
      employeename: employeeName 
    });
  })
    .catch(() => {
      res.status(500).render('error', {
        pageTitle: 'Server Error',
        path: '/loggedin',
        companyname: name,
        employeename: employeeName, 
        message: 'Something went wrong while loading the jobs details page.'
      });
    });
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
    res.status(200).render('manageEmployees', {
      pageTitle: "Tools for Tasks - Manage Employees",
      path:'/loggedin',
      companyname: companyName,
      managers,
      crew
    });
  })
  .catch(() => {
    res.status(500).render('error', {
      pageTitle: 'Server Error',
      path:'/loggedin',
      companyname: companyName,
      message: 'Something went wrong while loading the manage employees page.'
    });
  });
} 

/**---------------------------------------------EDIT EMPLOYEE PAGE-------------------------------------------------- */
exports.editEmployeePage = (req,res,next) => {
  const companyName = req.session.companyname;
  const { id } = req.params;
  const orgid = req.session.org;
  const error = req.query.error || null;

  Employees.findEmployeeById(orgid, id).then(([rows]) => {
    if (rows.length === 0) {
      return res.status(404).render('error', { 
        pageTitle: 'Employee not found',
        path: '/loggedin',
        companyname: companyName,
        message: 'Could not find employee'
      });
    }
    const employee = rows[0];

    res.status(200).render('editEmployeePage', {
      pageTitle: "Tools for Tasks - Edit Employee",
      path: '/loggedin',
      companyname: companyName,
      employee,
      error
    });
  })
  .catch(() => {
    res.status(500).render('error', {
      pageTitle: 'Server Error',
      path: '/loggedin',
      companyname: companyName,
      message: 'Something went wrong while loading the edit employee page.'
    });
  });
}

/**----------------------------------------------POST EDIT EMPLOYEE------------------------------------------------- */
exports.postEditEmployee = (req, res, next) => {
  const { id } = req.params;            // DB PK of this employee
  const orgid = req.session.org;
  const companyName = req.session.companyname;

  const employeeid = req.body.employeeid;  // owner-set ID
  const name = req.body.name;
  const role = req.body.role;
  const email = req.body.email;
  console.log(id);
  // 1) Check duplicate employeeid in same org, excluding THIS record
  return db.execute(
    'SELECT 1 FROM employees WHERE org_id = ? AND employeeid = ? AND id != ?',
    [orgid, employeeid, id]
  )
  .then(([rows]) => {
    if (rows.length > 0) {
      return res.redirect(303,`/loggedin/edit-employee/${id}?error=Employee id already exists`);
    }

    // 2) Check duplicate email in same org, excluding THIS record
    return db.execute(
      'SELECT 1 FROM employees WHERE org_id = ? AND email = ? AND id != ?',
      [orgid, email, id]
    );
  })
  .then(([rows]) => {
    if (res.headersSent) return; // stop if we already rendered due to duplicate
    if (rows.length > 0) {
      return res.redirect(303,`/loggedin/edit-employee/${id}?error=Employee email already exists`);
    }

    // 3) No duplicates → update
    return Employees.updateEmployee(id, employeeid, name, role, email, orgid);
  })
  .then(() => {
    if (!res.headersSent) {
      return res.redirect(303,'/loggedin/manageEmployees');
    }
  })
  .catch(() => {
    res.status(500).render('error', {
      pageTitle: 'Server Error',
      path:'/loggedin',
      companyname: companyName,
      message: 'Something went wrong while updating employee.'
    });
  });
};


/**-------------------------------------------------ADD EMPLOYEE---------------------------------------------------- */
exports.addEmployee = (req,res,next) => {
  const companyName = req.session.companyname;
    const error = null;

  res.status(200).render('addEmployeePage', {
      pageTitle: "Tools for Tasks - Edit Employee",
      path: '/loggedin',
      companyname: companyName,
      error    
  });
};

/**-----------------------------------------------POST ADD EMPLOYEE------------------------------------------------- */
exports.postAddEmployee = (req, res, next) => {
  const employeeid = req.body.employeeid;
  const name = req.body.name;
  const role = req.body.role;
  const email = req.body.email;
  const password = req.body.password;

  const companyName = req.session.companyname;
  const orgid = req.session.org;

  return db.execute('SELECT * FROM employees WHERE org_id = ? AND employeeid = ?', [orgid, employeeid])
    .then(([rows]) => {
      if (rows.length > 0) {
        return res.status(409).render('addEmployeePage', {
          pageTitle: "Tools for Tasks - Edit Employee",
          path: '/loggedin',
          companyname: companyName,
          error: 'Employee id already exists'
        });
      }

    return db.execute('SELECT * FROM employees WHERE org_id = ? AND email = ?', [orgid, email])
      .then(([rows]) => {
        if (rows.length > 0) {
          return res.status(409).render('addEmployeePage', {
            pageTitle: "Tools for Tasks - Edit Employee",
            path: '/loggedin',
            companyname: companyName,
            error: 'Employee email already exists'
          });
        }

        // No duplicates → proceed
        return bcrypt.hash(password, 12)
          .then((hashedPassword) => {
            const employee = new Employees(name, role, employeeid, email, hashedPassword, orgid);
            return employee.save();
          })
          .then(() => {
            return res.redirect(303,'/loggedin/manageEmployees');
          });
      });
  })
  .catch(() => {
    res.status(500).render('error', {
      pageTitle: 'Server Error',
      path:'/loggedin',
      companyname: companyName,
      message: 'Something went wrong while adding employee.'
    });
  });
};

/**-------------------------------------------------POST LOGOUT----------------------------------------------------- */
/** Hnadling post request when a user logouts */
exports.postLogout = (req,res,next) => {
    req.session.destroy(err => { // destroying session
        if (err) {
            return res.redirect(303,'/loggedin');
        }
        res.clearCookie('tft.sid'); // clearing cookie
        res.redirect(303,'/login'); // redirecting to login page
    });
};