const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { createNote, getNotes, getNoteById, updateNote, deleteNote } = require('../controllers/noteController');

router.use(verifyToken);

router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;
