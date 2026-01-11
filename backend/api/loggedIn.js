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
router.get("/jobs/:id", loggedinController.getJob);
router.get("/jobs/:id/employees", loggedinController.getEmployeesForJob)
router.post("/jobs", loggedinController.addJob);
router.delete("/jobs/:jobId/employees/:employeeId", loggedinController.deleteEmployeeFromJob);
router.patch("/jobs/:id", loggedinController.updateJob);
router.delete("/employees/:id", loggedinController.deleteEmployeeFromOrg);
router.post("/employees", loggedinController.addEmployee);
router.get("/employees/:id", loggedinController.getEmployee);
router.patch("/employees/:id", loggedinController.updateEmployee);
router.get("/accounts/:id", loggedinController.getAccountDetails);
router.patch("/accounts/:id", loggedinController.updateAccount);
router.get("/tools", loggedinController.getAllTools);
router.delete("/tools/:id", loggedinController.deleteTool);
router.get("/tool-kits", loggedinController.getAllToolKits);
router.delete("/tool-kits/:id", loggedinController.deleteToolKit);
router.post("/tools", loggedinController.addTool);
router.get("/tools/:id", loggedinController.getTool);
router.patch("/tools/:id", loggedinController.updateTool);
router.get("/tool-kits/:id/tools", loggedinController.getToolKitTools);
router.post("/tool-kit", loggedinController.addToolKit);
module.exports = router;
