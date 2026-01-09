const path = require('path'); // importing path for linux OS path compatability
const express = require('express'); // importing express
const loggedinController = require('../controllers/loggedin');

/**Creating a mini express router
 * I'm doing this because i dont want to spin up another express() object
 * so i create a mini express router that is mounted on the express object
 */
const router = express.Router(); // creating a mini express router


router.get("/jobs", loggedinController.getAllJobs);
router.delete("/jobs/:id", loggedinController.deleteJob);
router.get("/employees", loggedinController.getAllEmployees);
router.get("/jobDetails/:id", loggedinController.getJob);
router.get("/jobEmployees/:id", loggedinController.getEmployeesForJob)
router.post("/jobs", loggedinController.addJob);
router.delete("/employeesFromJobs/:jobId/employees/:employeeId", loggedinController.deleteEmployeeFromJob);
router.patch("/jobs/:id", loggedinController.updateJob);
router.delete("/employees/:id", loggedinController.deleteEmployeeFromOrg);
router.post("/employees", loggedinController.addEmployee);
router.get("/employeeDetails/:id", loggedinController.getEmployee);
router.patch("/employees/:id", loggedinController.updateEmployee);
router.get("/accountDetails/:id", loggedinController.getAccountDetails);
router.patch("/account/:id", loggedinController.updateAccount);
router.get("/tools", loggedinController.getAllTools);
router.delete("/tools/:id", loggedinController.deleteTool);
router.get("/toolKits", loggedinController.getAllToolKits);
router.delete("/toolKits/:id", loggedinController.deleteToolKit);
router.post("/tools", loggedinController.addTool);
module.exports = router;