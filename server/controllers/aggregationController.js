const User = require('../models/User');
const Post = require('../models/Post');
const mongoose = require('mongoose');

// Scenario 1: Group by Interests
// Constraint: Exactly one collection.aggregate() call. Do not use any other methods.
const getUsersByInterests = async (req, res) => {
  try {
    const result = await User.collection.aggregate([
      { $unwind: "$interests" },
      {
        $group: {
          _id: "$interests",
          users: {
            $push: {
              id: "$_id",
              username: "$username",
              email: "$email"
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Scenario 2: User Posts ($lookup)
// Constraint: Use a single aggregation pipeline with a $lookup stage.
const getUserPostsWithLookup = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format.' });
    }

    const result = await User.collection.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'posts',
          localField: '_id',
          foreignField: 'userId',
          as: 'posts'
        }
      },
      {
        $project: {
          password: 0
        }
      }
    ]).toArray();

    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper endpoint to create a test post (for testing aggregation scenario 2)
const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new Post({
      title,
      content,
      userId: req.user.id
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getUsersByInterests, getUserPostsWithLookup, createPost };
