const path = require('path'); // importing path for linux OS path compatability
const express = require('express'); // importing express

const ownerController = require('../controllers/owner');

/**Creating a mini express router
 * I'm doing this because i dont want to spin up another express() object 
 * so i create a mini express router that is mounted on the express object
 */
const router = express.Router(); // creating a mini express router

router.get('/', ownerController.getIndex);

router.get('/jobs', ownerController.jobsPage);

router.post('/post-addJob', ownerController.postAddJob);

router.get('/job-details/:id', ownerController.jobDetailsPage);

router.get('/edit-job/:id', ownerController.jobDetailsPage)

module.exports = router;