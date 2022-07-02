const router = require('express').Router();
const {
  getUsers,
  getUser,
  addUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', getUser);
router.post('/', addUser);
router.patch('/me', updateProfile);
router.patch('/avatar', updateAvatar);

module.exports = router;
