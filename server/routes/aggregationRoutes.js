const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { 
  getUsersByInterests, 
  getUserPostsWithLookup, 
  getUsersListForTesting, 
  createPost 
} = require('../controllers/aggregationController');

router.get('/interests', getUsersByInterests);
router.get('/users-list', getUsersListForTesting);
router.get('/user-posts/:identifier', getUserPostsWithLookup);
router.post('/posts', verifyToken, createPost);

module.exports = router;
