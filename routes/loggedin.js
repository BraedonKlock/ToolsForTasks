const path = require('path'); // importing path for linux OS path compatability
const express = require('express'); // importing express

const loggedinController = require('../controllers/loggedin');
const { requireRole } = require('../middleware/auth');  // not '/middleware/auth'

/**Creating a mini express router
 * I'm doing this because i dont want to spin up another express() object 
 * so i create a mini express router that is mounted on the express object
 */
const router = express.Router(); // creating a mini express router

router.get('/', loggedinController.getIndex);

router.get('/jobs', requireRole('owner', 'manager'), loggedinController.jobsPage);

router.post('/post-addJob', requireRole('owner', 'manager'), loggedinController.postAddJob);

router.get('/job-details/:id', loggedinController.jobDetailsPage);

router.get('/edit-job/:id', requireRole('owner', 'manager'), loggedinController.jobDetailsPage);

router.post('/logout', loggedinController.postLogout);

module.exports = router;