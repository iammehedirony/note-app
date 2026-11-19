const express = require('express');
const router = express.Router();
const { verifyAdmin } = require('../middleware/auth');
const { getAllUsers, createUser, updateUser, deleteUser, getAllNotes } = require('../controllers/adminController');

router.use(verifyAdmin);

router.get('/users', getAllUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/notes', getAllNotes);

module.exports = router;
