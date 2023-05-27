const express = require('express')
const router = express.Router()
const dallEController = require('../controllers/dallEController')
const verifyJWT = require('../middleware/verifyJWT')
router.use(verifyJWT)
router.get('/:message', dallEController.handleUserMessage);

module.exports = router