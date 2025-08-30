const path = require('path'); // importing path for linux OS path compatability
const express = require('express'); // importing express

const foremanController = require('../controllers/foreman');

/**Creating a mini express router
 * I'm doing this because i dont want to spin up another express() object 
 * so i create a mini express router that is mounted on the express object
 */
const router = express.Router(); // creating a mini express router

router.get('/', foremanController.getIndex);

router.get('/jobs', foremanController.jobsPage)

router.post('/post-addJob', foremanController.postAddJob);

router.get('/job-details/:id', foremanController.jobDetailsPage)

module.exports = router;