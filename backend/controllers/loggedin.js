/**
 * This file is responsible for handling post and get requests
 */
const fs = require('fs');
const path = require('path');
const User = require('../models/user');
const Jobs = require('../models/jobs'); // importing jobs object from models
const Employees = require('../models/employee');
const Tools = require('../models/tools');
const ToolKits = require('../models/toolKits');
const db = require('../util/database');
const bcrypt = require('bcryptjs'); // importing encryption for user passwords

// Helper function to delete uploaded images
function deleteImageFile(folder, filename) {
  // Don't delete if no filename, or if it's a default image
  if (!filename || filename === 'default.png') return;

  const filePath = path.join(__dirname, '..', 'uploads', folder, filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`Failed to delete image: ${filePath}`, err);
    }
  });
}

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

    // Get job first to retrieve image filename before deletion
    let jobImage = null;
    try {
      const jobRows = await Jobs.getJob(orgId, id);
      if (jobRows && jobRows[0]) {
        jobImage = jobRows[0].image;
      }
    } catch (e) {
      // Job not found, continue with deletion attempt
    }

    const [result] = await Jobs.deleteJobById(orgId, id);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Delete job image file if it exists
    if (jobImage) {
      deleteImageFile('jobs', jobImage);
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
exports.updateJobToolSelection = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "unauthenticated" });

    const jobId = Number(req.params.id);
    const toolId = Number(req.params.toolId);
    const orgId = req.user.orgId;

    const { isSelected } = req.body;
    const normalized =
      isSelected === true || isSelected === 1 || isSelected === "1"
        ? 1
        : isSelected === false || isSelected === 0 || isSelected === "0"
          ? 0
          : null;

    if (!Number.isInteger(jobId) || !Number.isInteger(toolId) || normalized === null) {
      return res.status(400).json({ error: "Invalid job, tool, or selection value." });
    }

    const [result] = await Jobs.updateJobToolSelection(jobId, toolId, normalized, orgId);
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: "Could not update tool selection for this job." });
    }

    const io = req.app.get("io");
    if (io && orgId) {
      io.to(`org:${orgId}`).emit("jobTools:changed", {
        jobId,
        toolId,
        isSelected: normalized
      });
    }

    res.status(200).json({ ok: true });
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
      jobid,
      title,
      date,
      address,
      phoneNumber,
      notes
    } = req.body;

    // Parse JSON strings from FormData (arrays sent as JSON strings)
    let employeeIds = [];
    let toolKitIds = [];
    let toolSelections = [];
    try {
      if (req.body.employeeIds) {
        employeeIds = JSON.parse(req.body.employeeIds);
      }
      if (req.body.toolKitIds) {
        toolKitIds = JSON.parse(req.body.toolKitIds);
      }
      if (req.body.toolSelections) {
        toolSelections = JSON.parse(req.body.toolSelections);
      }
    } catch (e) {
      // If parsing fails, arrays remain empty
    }

    // Use uploaded file name or null (will display job ID as fallback)
    const image = req.file ? req.file.filename : null;

    const jobIdInt = Number.parseInt(jobid, 10);
    const cleanDate = (date && String(date).trim() !== "") ? date : null;

    if (!Number.isInteger(jobIdInt)) {
      return res.status(400).json({ error: "jobid must be an integer" });
    };

    const job = new Jobs(jobIdInt, title, cleanDate, address, phoneNumber, notes, orgId, image)
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

    const resolvedToolSelections = Array.isArray(toolSelections) ? toolSelections : [];

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
      jobid,
      title,
      date,
      address,
      phoneNumber,
      notes,
      currentImage
    } = req.body;

    // Parse JSON strings from FormData (arrays sent as JSON strings)
    let employeeIds = [];
    let toolKitIds = [];
    let toolSelections = [];
    try {
      if (req.body.employeeIds) {
        employeeIds = JSON.parse(req.body.employeeIds);
      }
      if (req.body.toolKitIds) {
        toolKitIds = JSON.parse(req.body.toolKitIds);
      }
      if (req.body.toolSelections) {
        toolSelections = JSON.parse(req.body.toolSelections);
      }
    } catch (e) {
      // If parsing fails, arrays remain empty
    }

    // Use new uploaded file if present, otherwise keep existing image
    const image = req.file ? req.file.filename : (currentImage || null);

    // Delete old image if a new one is uploaded
    if (req.file && currentImage) {
      deleteImageFile('jobs', currentImage);
    }

    const cleanDate = (date && String(date).trim() !== "") ? date : null;
    const jobIdInt = Number.parseInt(jobid, 10);
    if (!Number.isInteger(jobIdInt)) {
      return res.status(400).json({ error: "jobid must be an integer" });
    };

    const job = new Jobs(jobid, title, cleanDate, address, phoneNumber, notes, orgId, image);

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

    const resolvedToolSelections = Array.isArray(toolSelections) ? toolSelections : [];

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

    // Get employee first to retrieve avatar filename before deletion
    let employeeAvatar = null;
    try {
      const rows = await Employees.findEmployeeById(orgId, id);
      if (rows && rows[0]) {
        employeeAvatar = rows[0].avatar;
      }
    } catch (e) {
      // Employee not found, continue with deletion attempt
    }

    const [result] = await Employees.deleteEmployeeFromOrg(orgId, id);

    if(!result || result.affectedRows === 0) {
      return res.status(404).json({error: "Could not delete employee, please try again later."})
    }

    // Delete employee avatar file if it exists
    if (employeeAvatar) {
      deleteImageFile('employees', employeeAvatar);
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

    let { email, employeeid, name, password, role } = req.body;

    // Use uploaded file name or default.png
    const avatar = req.file ? req.file.filename : 'default.png';

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

    let {employeeid, name, role, email, password, currentAvatar } = req.body;

    // Use new uploaded file if present, otherwise keep existing avatar
    const avatar = req.file ? req.file.filename : currentAvatar;

    // Delete old avatar if a new one is uploaded
    if (req.file && currentAvatar) {
      deleteImageFile('employees', currentAvatar);
    }

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
    if(!req.user) return res.status(401).json({ error: "Unauthenticated" });
    const { orgId, role } = req.user;
    if (role !== "owner" && role !== "manager") return res.status(403).json({error: "Do not have permission."});

    const { name, tools } = req.body;

    // Handle bulk tool creation
    if (Array.isArray(tools)) {
      const validTools = tools.filter(t => t.name && t.name.trim() !== "");
      if (validTools.length === 0) {
        return res.status(400).json({ error: "At least one tool name is required" });
      }

      const [result] = await Tools.addTools(validTools, orgId);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Could not add tools, please try again later." });
      }

      res.status(201).json({ ok: true, count: result.affectedRows });

      const io = req.app.get("io");
      if (io && orgId) {
        io.to(`org:${orgId}`).emit("tools:changed");
      }
      return;
    }

    // Handle single tool creation (backward compatibility)
    if(name.trim() === "") return res.status(400).json({error: "Name field can not be empty"})

    const quantity = 1;
    const [result] = await Tools.addTool(name, quantity, orgId);

    if (result.affectedRows === 0) return res.status(404).json({error: "Could not add Tool, please try again later."});

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
