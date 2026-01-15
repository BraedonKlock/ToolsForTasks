/**
 * This file is responsible for handling post and get requests
 */
const User = require('../models/user');
const Jobs = require('../models/jobs'); // importing jobs object from models
const Employees = require('../models/employee');
const Tools = require('../models/tools');
const ToolKits = require('../models/toolKits');
const db = require('../util/database');
const bcrypt = require('bcryptjs'); // importing encryption for user passwords

/**-------------------------------------------------------------------------------------------------*/
exports.getAllJobs = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const role = (req.user.role || "").trim().toLowerCase();
    const orgId = req.user.orgId;
    const employeeId = req.user.employeeId;

    const loginID = role === "owner" ? orgId : employeeId;
    if (!loginID) return res.status(400).json({ error: "Missing login id" });

    const [rows] = await Jobs.getAllJobs(loginID, role);

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

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const { id } = req.params;
    const { orgId } = req.user;

    const [result] = await Jobs.deleteJobById(orgId, id);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.status(200).json({ ok: true });

    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("jobs:changed");
    }
  } catch (err) {
    console.error("deleteJob error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

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

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }

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
exports.getToolsForJob = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthenticated" });

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const { id } = req.params;
    const { orgId } = req.user;
    const [rows] = await Jobs.getToolsForJob(id, orgId);

    res.status(200).json({
      ok: true,
      tools: rows
    });
  } catch (err) {
    res.status(500).json();
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.getToolKitsForJob = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthenticated" });

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const { id } = req.params;
    const { orgId } = req.user;
    const [rows] = await Jobs.getToolKitsForJob(id, orgId);

    res.status(200).json({
      ok: true,
      toolKits: rows
    });
  } catch (err) {
    res.status(500).json();
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.addJob = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({error: "unauthenticated"});

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const orgId = req.user.orgId;

    const {
      jobType,
      jobid,
      title,
      date,
      address,
      phoneNumber,
      notes,
      employeeIds = [],
      toolKitIds = [],
      toolIds = [],
      toolSelections = []
    } = req.body;

    const jobIdInt = Number.parseInt(jobid, 10);
    const cleanDate = (date && String(date).trim() !== "") ? date : null;

    if (!Number.isInteger(jobIdInt)) {
      return res.status(400).json({ error: "jobid must be an integer" });
    };

    const job = new Jobs(jobType, jobIdInt, title, cleanDate, address, phoneNumber, notes, orgId)
    const addJobResult = await job.addJob()

    if (addJobResult.affectedRows !== 1 || !addJobResult.insertId) return res.status(500).json({error: "Failed to add job, please try again later."});
    
    if (Array.isArray(employeeIds) && employeeIds.length > 0) {
      const dbJobId = addJobResult.insertId;
      const assignEmployeesToJobResult =  await Jobs.assignEmployeesToJob(dbJobId, employeeIds);
      
      if (assignEmployeesToJobResult.affectedRows === 0) return res.status(404).json({error: "Failed to assign employees to the job, please try again later."});
    }

    if (Array.isArray(toolKitIds) && toolKitIds.length > 0) {
      const dbJobId = addJobResult.insertId;
      const assignToolKitsToJobResult = await Jobs.assignToolKitsToJob(dbJobId, toolKitIds);

      if (assignToolKitsToJobResult.affectedRows === 0) {
        return res.status(404).json({ error: "Failed to assign tool kits to the job, please try again later." });
      }
    }

    const resolvedToolSelections = Array.isArray(toolSelections) && toolSelections.length > 0
      ? toolSelections
      : (Array.isArray(toolIds) ? toolIds.map((id) => ({ tool_id: id, quantity: 1 })) : []);

    if (resolvedToolSelections.length > 0) {
      const dbJobId = addJobResult.insertId;
      const assignToolsToJobResult = await Jobs.assignToolsToJob(dbJobId, resolvedToolSelections);

      if (assignToolsToJobResult.affectedRows === 0) {
        return res.status(404).json({ error: "Failed to assign tools to the job, please try again later." });
      }
    }

    // emit jobs:changed so all sockets in the org room can reload jobs
    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("jobs:changed");
    }

    res.status(201).json({
      ok: true
    })
  } catch(err) {
    if (err && (err.code === "ER_DUP_ENTRY" || err.errno === 1062)) {
      return res.status(409).json({ error: "Job ID already exists for this company." });
    }
    res.status(500).json();
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.updateJob = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({error: "unauthenticated"});

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const orgId = req.user.orgId;
    const dbJobId = Number(req.params.id);
    
    const {
      jobType,
      jobid,
      title,
      date,
      address,
      phoneNumber,
      notes,
      employeeIds = [],
      toolKitIds = [],
      toolIds = [],
      toolSelections = []
    } = req.body;
    
    const cleanDate = (date && String(date).trim() !== "") ? date : null;
    const jobIdInt = Number.parseInt(jobid, 10);
    if (!Number.isInteger(jobIdInt)) {
      return res.status(400).json({ error: "jobid must be an integer" });
    };

    const job = new Jobs(jobType, jobid, title, cleanDate, address, phoneNumber, notes, orgId);

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

    if (Array.isArray(toolKitIds) && toolKitIds.length > 0) {
      await Jobs.deleteToolKitsForJob(dbJobId);
      const [assignToolKitsToJobResult] = await Jobs.assignToolKitsToJob(dbJobId, toolKitIds);

      if (assignToolKitsToJobResult.affectedRows === 0) {
        const err = new Error("Could not assign tool kits to the job, please try again later");
        err.status = 404;
        throw err;
      }
    } else {
      await Jobs.deleteToolKitsForJob(dbJobId);
    }

    const resolvedToolSelections = Array.isArray(toolSelections) && toolSelections.length > 0
      ? toolSelections
      : (Array.isArray(toolIds) ? toolIds.map((id) => ({ tool_id: id, quantity: 1 })) : []);

    if (resolvedToolSelections.length > 0) {
      await Jobs.deleteToolsForJob(dbJobId);
      const [assignToolsToJobResult] = await Jobs.assignToolsToJob(dbJobId, resolvedToolSelections);

      if (assignToolsToJobResult.affectedRows === 0) {
        const err = new Error("Could not assign tools to the job, please try again later");
        err.status = 404;
        throw err;
      }
    } else {
      await Jobs.deleteToolsForJob(dbJobId);
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
    if (err && (err.code === "ER_DUP_ENTRY" || err.errno === 1062)) {
      return res.status(409).json({ error: "Job ID already exists for this company." });
    }
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

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }

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
exports.getAllEmployees = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }
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
exports.deleteEmployeeFromOrg = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({error: "unauthenticated"});

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const { id } = req.params;
    const orgId = req.user.orgId;

    const [result] = await Employees.deleteEmployeeFromOrg(orgId, id);

    if(!result || result.affectedRows === 0) {
      return res.status(404).json({error: "Could not delete employee, please try again later."})
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

    const userRole = (req.user.role || "").trim().toLowerCase();
    if (userRole !== "owner") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const orgId = req.user.orgId;
    const companyName = req.user.companyName;

    let { email, employeeid, name, password, role, avatar } = req.body;

    const employeeIdInt = Number.parseInt(employeeid, 10);
    if (!Number.isInteger(employeeIdInt)) {
      return res.status(400).json({ error: "Employee id must be an integer" });
    };

    email = (email || "").trim().toLowerCase();

    let passwordHash;
    if (typeof password === "string" && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 12);
    } else {
      return res.status(400).json({ error: "Password must not contain spaces" });
    }

    const employee = new Employees(name, role, employeeid, email, passwordHash, avatar, orgId, companyName);

    const addEmployeeResult = await employee.addEmployee();

    if(addEmployeeResult.affectedRows !== 1 || !addEmployeeResult.insertId) return res.status(500).json({error: "Failed to add employee, please try again later."});

    res.status(201).json({ok: true});

  } catch(err) {
    if (err && (err.code === "ER_DUP_ENTRY" || err.errno === 1062)) {
      return res.status(409).json({ error: "Email or id already exists for this company." });
    }
    res.status(500).json();
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.getEmployee = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({error: "Unauthenticated"});

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const { orgId } = req.user;
    const { id } = req.params;

    const rows = await Employees.findEmployeeById(orgId, id);

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

    const userRole = (req.user.role || "").trim().toLowerCase();
    if (userRole !== "owner") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const { orgId } = req.user;
    const { id } = req.params;

    let {employeeid, name, role, email, avatar, password } = req.body;

    const employeeIdInt = Number.parseInt(employeeid, 10);
    if (!Number.isInteger(employeeIdInt)) {
      return res.status(400).json({ error: "Employee id must be an integer" });
    };

    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();

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
    if (err && (err.code === "ER_DUP_ENTRY" || err.errno === 1062)) {
      return res.status(409).json({ error: "Email or id already exists for this company." });
    }
    res.status(500).json();
  }
}

/**------------------------------------------------------------------------------------------------ */
exports.getAccountDetails = async (req,res) => {
  try {
    if(!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner") {
      return res.status(403).json({ error: "Do not have permission." });
    }

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

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const { id } = req.params;
    let { name, email, password } = req.body;

    name = (name || "").trim();
    email = (email || "").trim().toLowerCase();

    let passwordHash;
    if (typeof password === "string" && password.trim().length > 0) {
      passwordHash = await bcrypt.hash(password.trim(), 12);
    }
    const result = await User.updateUser(id, name, email, passwordHash);

    if(result.affectedRows !== 1) {
      return res.status(404).json({error: "Could not update account, please try again later."});
    }

    res.status(200).json({ok: true});
  } catch(err) {
    res.status(500);
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.getAllTools = async (req,res) => {
  try {
    if(!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const {orgId} = req.user;

    const [tools] = await Tools.getAllTools(orgId);

    res.status(200).json({ ok: true, tools})

  }catch(err) {
    res.status(500).json({error: "Internal server error."});
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.deleteTool = async (req,res) => {
  try {
    if(!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const { orgId } = req.user;
    const { id } = req.params;

    const [result] = await Tools.deleteTool(orgId, id);

    if(!result.affectedRows) {
      return res.status(400).json({error: "Could not delete Tool, please try again later."})
    }

    res.status(200).json({ok: true});

    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("tools:changed");
    }

  }catch(err) {
    if(err.message) {
      res.status(err.status).json({error: err.message});
    }
    res.status(500).json({error: "internal server error"});
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.getAllToolKits = async (req,res) => {
  try {
    if(!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }

    const { orgId } = req.user;

    const [toolKits] = await ToolKits.getAllToolKits(orgId);
    res.status(200).json({ok: true, toolKits})

  }catch(err) {
    res.status(500).json({error: "Internal server error"})
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.deleteToolKit = async(req,res) => {
  try {
    if(!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const role = (req.user.role || "").trim().toLowerCase();
    if (role !== "owner" && role !== "manager") {
      return res.status(403).json({ error: "Do not have permission." });
    }
    
    const { orgId } = req.user;
    const { id } = req.params;
    const [result] = await ToolKits.deleteToolKit(orgId, id);

    if (result.affectedRows === 0) {
      res.status(400).json({error: "Could not delete Tool kit, please try again later."})
    }
    res.status(200).json({ok: true});

    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("toolKits:changed");
    }

  }catch(err) {
    res.status(500).json({error: "Internal server error."})
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.addTool = async(req,res) => {
  try {
    if(!req.user) res.status(401).json({ error: "Unauthenticated" });
    const { orgId, role } = req.user;
    if (role !== "owner" && role !== "manager") return res.status(403).json({error: "Do not have permission."});

    const { name } = req.body;

    if(name.trim() === "") return res.status(400).json({error: "Name field can not be empty"})

    const quantity = 1;
    const [result] = await Tools.addTool(name, quantity, orgId);

    if (result.affectedRows === 0) res.status(404).json({error: "Could not add Tool, please try again later."});

    res.status(201).json({ok: true});

    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("tools:changed");
    }

  } catch(err) {
    res.status(500).json({error: "Internal server error."})
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.getTool = async(req,res) => {
  try {
    if(!req.user) res.status(401).json({ error: "Unauthenticated" });
    const { orgId, role } = req.user;
    if (role !== "owner" && role !== "manager") return res.status(403).json({error: "Do not have permission."});

    const { id } = req.params;
    const [rows] = await Tools.getTool(orgId, id);

    if (rows.length === 0) return res.status(404).json({error: "Could not get Tool details, please try again later."});

    res.status(200).json({ok: true, tool: rows[0] })
  } catch(err) {
    res.status(500).json({error: "Internal server error."})
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.updateTool = async(req,res) => {
  try {
    if(!req.user) res.status(401).json({ error: "Unauthenticated" });

    const { orgId, role } = req.user;
    if (role !== "owner" && role !== "manager") return res.status(403).json({error: "Do not have permission."});

    const { name } = req.body;
    const { id } = req.params;

    if(name.trim() === "") return res.status(400).json({error: "Name field can not be empty"})

    const [result] = await Tools.updateTool(name, orgId, id);

    if (result.affectedRows === 0) res.status(404).json({error: "Could not add Tool, please try again later."});

    res.status(200).json({ok: true});

    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("tools:changed");
    }

  } catch(err) {
    res.status(500).json({error: "Internal server error."})
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.getToolKitTools = async (req, res) => {
  try {
    if(!req.user) res.status(401).json({ error: "Unauthenticated" });

    const { orgId, role } = req.user;
    if (role !== "owner" && role !== "manager") return res.status(403).json({error: "Do not have permission."});

    const { id } = req.params;
    const [rows] = await ToolKits.getToolKitTools(id);

    res.status(200).json({ok: true, tools: rows});

  } catch(err) {
    res.status(err.status || 500).json({error: err.message || "Internal server error."})
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.addToolKit = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const { orgId, role } = req.user;
    if (role !== "owner" && role !== "manager")
      return res.status(403).json({ error: "Do not have permission." });

    const { name, tools } = req.body;

    if (!name || !Array.isArray(tools)) {
      return res.status(400).json({ error: "Invalid payload." });
    }

    const [result] = await ToolKits.addToolKit(orgId, name);
    if (!result || result.affectedRows === 0) {
      return res.status(400).json({ error: "Could not add tool kit, please try again later." });
    }

    const toolkitId = result.insertId;

    await Promise.all(
      tools.map((t) =>
        ToolKits.addToolsToToolKit(toolkitId, t.tool_id, t.quantity)
      )
    );

    res.status(201).json({ ok: true, toolkitId });

    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("toolKits:changed");
    }

  } catch (err) {
    return res.status(500).json({ error: "Internal server error." });
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.getToolKit = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const { orgId, role } = req.user;
    if (role !== "owner" && role !== "manager")
      return res.status(403).json({ error: "Do not have permission." });
    
    const { id } = req.params;

    const [rows] = await ToolKits.getToolKit(orgId, id);

    if (rows.length === 0) return res.status(404).json({error: "Could not get tool kit details, please try again later."});

    return res.status(200).json({ok: true, toolKit: rows[0]});

  } catch(err) {
    res.status(500).json({error: "Internal sserver error."})
  }
}
/**------------------------------------------------------------------------------------------------ */
exports.updateToolKit = async (req,res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const { orgId, role } = req.user;
    if (role !== "owner" && role !== "manager")
      return res.status(403).json({ error: "Do not have permission." });

    const { name, tools } = req.body;
    const resolvedToolKitId = Number(req.params.id);

    if (!Number.isInteger(resolvedToolKitId)) {
      return res.status(400).json({ error: "Invalid tool kit id." });
    }

    if (!name || !Array.isArray(tools)) {
      return res.status(400).json({ error: "Invalid payload." });
    }

    const [result] = await ToolKits.updateToolKit(orgId, resolvedToolKitId, name);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: "Could not update tool kit, please try again later." });
    }

    await ToolKits.deleteToolKitTools(resolvedToolKitId);

    if (tools.length > 0) {
      await Promise.all(
        tools.map((t) =>
          ToolKits.addToolsToToolKit(resolvedToolKitId, t.tool_id, t.quantity)
        )
      );
    }

    res.status(200).json({ ok: true });

    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("toolKits:changed");
    }
    
  } catch(err) {
    res.status(500).json({error: "Internal server error."})
  }
}
