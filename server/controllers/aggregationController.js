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
// Supports both ObjectId and username/email for easy testing.
const getUserPostsWithLookup = async (req, res) => {
  try {
    const { identifier } = req.params;

    let matchCondition = {};
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      matchCondition = { _id: new mongoose.Types.ObjectId(identifier) };
    } else {
      matchCondition = { $or: [{ username: identifier }, { email: identifier }] };
    }

    const result = await User.collection.aggregate([
      { $match: matchCondition },
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
      return res.status(404).json({ error: 'User not found by ID, username, or email.' });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Helper to list users for easy testing of aggregation scenario 2
const getUsersListForTesting = async (req, res) => {
  try {
    const users = await User.find({}, { username: 1, email: 1, role: 1 });
    res.json(users);
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

module.exports = { getUsersByInterests, getUserPostsWithLookup, getUsersListForTesting, createPost };
