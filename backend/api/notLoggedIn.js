/**This file handles routing for the home page */
const express = require("express");
const path = require('path'); // importing path for linux OS path compatability

const notLoggedInController = require('../controllers/notLoggedIn');

/**Creating a mini express router
 * I'm doing this because i dont want to spin up another express() object
 * so i create a mini express router that is mounted on the express object
 */
const router = express.Router(); // creating a mini express router

//REACT ROUTES
router.post("/login", notLoggedInController.login);



module.exports = router;