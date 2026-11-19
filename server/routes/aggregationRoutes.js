const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { getUsersByInterests, getUserPostsWithLookup, createPost } = require('../controllers/aggregationController');

router.get('/interests', getUsersByInterests);
router.get('/user-posts/:userId', getUserPostsWithLookup);
router.post('/posts', verifyToken, createPost);

module.exports = router;
