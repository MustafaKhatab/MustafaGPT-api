const express = require('express')
const router = express.Router()
const chatsController = require('../controllers/chatsController')
const verifyJWT = require('../middleware/verifyJWT')
router.use(verifyJWT)

router.post('/message', chatsController.handleUserMessageAndCreation);
router.post('/:chatId', chatsController.handleUserMessage);
router.get('/:userId', chatsController.getUserChats);

router.route('/')
    .get(chatsController.getAllChats)
    .post(chatsController.createNewChat)
    .patch(chatsController.updateChat)
    .delete(chatsController.deleteChat)


module.exports = router