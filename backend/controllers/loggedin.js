/**
 * This file is responsible for handling post and get requests
 */
const User = require('../models/user');
const Jobs = require('../models/jobs'); // importing jobs object from models
const Employees = require('../models/employee');
const db = require('../util/database');
const bcrypt = require('bcryptjs'); // importing encryption for user passwords

/**-------------------------------------------------------------------------------------------------*/
exports.getAllJobs = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const { sub: userId, role } = req.user; // from JWT claims

    const [rows] = await Jobs.getAllJobs(userId, role);

    // Return JSON;
    res.status(200).json({
      ok: true,
      jobs: rows,
    });
  } catch (err) {
    res.status(500).json();
  }
};

/**-------------------------------------------------------------------------------------------------*/
exports.deleteJob = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const { id } = req.params;
    const { orgId } = req.user;
    const [result] = await Jobs.deleteJobById(orgId, id);

    if (result.affectedRows === 0) {
      return res.status(404).json();
    }

    // emit jobs:changed so all sockets in the org room can reload jobs
    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("jobs:changed");
    }

    res.status(200).json({
      ok: true,
    });
  } catch (err) {
    res.status(500).json();
  }
};

/**-------------------------------------------------------------------------------------------------*/
exports.getAllEmployees = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const { orgId } = req.user;
    const [rows] = await Employees.getAllEmployeesByOrg(orgId);
    res.status(200).json({
      ok: true,
      employees: rows,
    });
  } catch (err) {
    res.status(500).json();
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.getJob = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const { orgId } = req.user;
    const { id } = req.params;

    const rows = await Jobs.getJob(orgId, id)
    if(rows.length === 0) {
      res.status(404).json();
    }

    if(rows.length > 0) {
      res.status(200).json({
        ok: true,
        job: rows[0]
      })
    }

  } catch(err) {
    res.status(500).json();
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.getEmployeesForJob = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({error: "unauthenticated"});
    const {id} = req.params;
    const [rows] = await Employees.findEmployeesforJob(id)
    res.status(200).json({
      ok: true,
      employees: rows
    });
  } catch(err) {
    res.status(500).json();
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.addJob = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({error: "unauthenticated"});
    
    const orgId = req.user.orgId;

    const { jobType, jobid, title, date, address, phoneNumber, notes, employeeIds = [] } = req.body;

    const jobIdInt = Number.parseInt(jobid, 10);

    if (!Number.isInteger(jobIdInt)) {
      return res.status(400).json({ error: "jobid must be an integer" });
    };

    const job = new Jobs(jobType, jobid, title, date, address, phoneNumber, notes, orgId)
    const addJobResult = await job.addJob()

    if (addJobResult.affectedRows !== 1 || !addJobResult.insertId) return res.status(500).json({error: "Failed to add job, please try again later."});
    
    if (employeeIds.length > 0) {
      const dbJobId = addJobResult.insertId;
      const assignEmployeesToJobResult =  await Jobs.assignEmployeesToJob(dbJobId, employeeIds);
      
      if (assignEmployeesToJobResult.affectedRows === 0) return res.status(500).json({error: "Failed to assign employees to the job, please try again later."});
    }

    // emit jobs:changed so all sockets in the org room can reload jobs
    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("jobs:changed");
    }

    res.status(200).json({
      ok: true
    })
  } catch(err) {
    res.status(500).json();
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.updateJob = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({error: "unauthenticated"});
    const orgId = req.user.orgId;
    const dbJobId = Number(req.params.id);

    const { jobType, jobid, title, date, address, phoneNumber, notes, employeeIds = [] } = req.body;

    const job = new Jobs(jobType, jobid, title, date, address, phoneNumber, notes, orgId);

    const [result] = await job.updateJob(dbJobId);

    if(!result || result.affectedRows === 0) {
      const err = new Error("Could not update Job, please try again later.");
      err.status = 404
      throw err;
    }

    if (Array.isArray(employeeIds) && employeeIds.length > 0) {
      const [assignEmployeesToJobResult] = await Jobs.assignEmployeesToJob(dbJobId, employeeIds);
      
      if (assignEmployeesToJobResult.affectedRows === 0) {
        const err = new Error("Could not assign employees to the job, please try again later");
        err.status = 404;
        throw err;
      }
    }

    // emit jobs:changed so all sockets in the org room can reload jobs
    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("jobs:changed");
    }

    res.status(200).json({
      ok:true
    })
  } catch(err) {
    if (err.status === 404) {
      res.status(err.status).json({error: err.message})
    } else {
      res.status(500).json({error: "Could not update job, please try again later"});
    }
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.deleteEmployeeFromJob = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({error: "unauthenticated"});

    const { jobId, employeeId } = req.params;
    const orgId = req.user.orgId;
    
    const result = await Jobs.deleteEmployeeFromJob(jobId, employeeId);
    if (!result || result.affectedRows === 0) {
      const err = new Error("Could not delete employee from job, please try again later");
      err.status = 404
      throw err;
    }

    // emit jobs:changed so all sockets in the org room can reload jobs
    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("jobs:changed");
    }

    res.status(200).json({
      ok: true
    });
  } catch(err) {
    if (err.status == 404) {
      res.status(err.status).json({
        error: err.message
      });
    } else {
        res.status(500).json({
        error: "Could not delete employee from job, please try again later"
        });
      }
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.deleteEmployeeFromOrg = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({error: "unauthenticated"});

    const { id } = req.params;
    const orgId = req.user.orgId;

    const [result] = await Employees.deleteEmployeeFromOrg(orgId, id);

    if(!result || result.affectedRows === 0) {
      return res.status().json({error: "Could not delete employee, please try again later."})
    }

    res.status(200).json({ok: true});

  } catch(err) {
    res.status(500).json({error: "Could not delete employee, please try again later."})
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.addEmployee = async (req, res) => {
  try {
    if(!req.user) return res.status(401).json({error: "unauthenticated"});

    const orgId = req.user.orgId;
    const companyName = req.user.companyName;

    const { email, employeeid, name, password, role, avatar } = req.body;

    email.trim().toLowerCase();
    password.trim();

    const passwordHash = await bcrypt.hash(password, 12);

    const employee = new Employees(name, role, employeeid, email, passwordHash, avatar, orgId, companyName);

    const addEmployeeResult = await employee.addEmployee();

    if(addEmployeeResult.affectedRows !== 1 || !addEmployeeResult.insertId) return res.status(500).json({error: "Failed to add employee, please try again later."});

    res.status(200).json({ok: true});

  } catch(err) {
    if (err && (err.code === "ER_DUP_ENTRY" || err.errno === 1062)) {
      return res.status(409).json({ error: "Email already exists for this company." });
    }
    res.status(500).json();
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.getEmployee = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthenticated"});

    const { orgId } = req.user;
    const { id } = req.params;

    const rows = await Employees.findEmployeeById( orgId, id);

    if(rows.length === 0) {
      res.status(404).json();
    }
    if(rows.length > 0) {
      res.status(200).json({ ok: true, employee: rows[0]});
    }
  } catch(err) {
    res.status(500).json();
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.updateEmployee = async (req,res) => {
  try {
    if(!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const { orgId } = req.user;
    const { id } = req.params;

    let {employeeid, name, role, email, avatar, password } = req.body;

    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();

    // If password provided, hash it, else keep it undefined
    let passwordHash;
    if (typeof password === "string" && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 12);
    }
    const result = await Employees.updateEmployee(orgId, id, name, role, employeeid, email, passwordHash, avatar);

    if(result.affectedRows !== 1) {
      return res.status(404).json({error: "Could not update employee, please try again later."});
    }

    res.status(200).json({ok: true})
  } catch(err) {
    res.status(500).json();
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.getAccountDetails = async (req,res) => {
  try {
    if(!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const { id } = req.params;

    const [ rows ] = await User.findUserById(id);

    if(!rows ||rows.length === 0) {
      res.status(404).json({error: "Could not load account details, please try again later"});
    }
    const { password, ...account } = rows[0];
    res.status(200).json({ok: true, account})
  } catch(err) {
    res.status(500);
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.updateAccount = async (req,res) => {
  try {
    if(!req.user) return res.status(401).json({ error: "Unauthenticated" });
    const { id } = req.params;
    let { type, name, email, password } = req.body;

    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();

    let passwordHash;
    if (typeof password === "string" && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 12);
    }
    const result = await User.updateUser(id, type, name, email, passwordHash);

    if(result.affectedRows !== 1) {
      return res.status(404).json({error: "Could not update account, please try again later."});
    }

    res.status(200).json({ok: true});
  } catch(err) {
    res.status(500);
  }
}