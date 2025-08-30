/**This file handles routing for the home page */

const path = require('path'); // importing path for linux OS path compatability
const express = require('express'); // importing express

const homeController = require('../controllers/home');

/**Creating a mini express router
 * I'm doing this because i dont want to spin up another express() object 
 * so i create a mini express router that is mounted on the express object
 */
const router = express.Router(); // creating a mini express router

router.get('/', homeController.getIndex);

router.get('/login', homeController.getLogin);

router.get('/create-account', homeController.getCreateAccount);

router.post('/post-createAccount', homeController.postCreateAccount);

module.exports = router;