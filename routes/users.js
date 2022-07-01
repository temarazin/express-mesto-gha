const router = require('express').Router();
const { getUsers, getUser, addUser } = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', getUser);
router.post('/', addUser);

module.exports = router;
