/**This file handles routing for the home page */

const path = require('path'); // importing path for linux OS path compatability

const homeController = require('../controllers/home');

/**Creating a mini express router
 * I'm doing this because i dont want to spin up another express() object
 * so i create a mini express router that is mounted on the express object
 */
const router = express.Router(); // creating a mini express router

//REACT ROUTES
router.get("/", (_req, res) => res.json({ ok: true, area: "public" }));

router.post("/post-login", homeController.postLogin);



module.exports = router;