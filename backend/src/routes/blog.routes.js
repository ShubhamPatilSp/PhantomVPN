const express = require('express');
const router = express.Router();
const { BlogPost } = require('../models/index');
const { apiLimiter } = require('../middleware/rateLimit');

router.get('/posts', apiLimiter, async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }
    const posts = await BlogPost.find(query).select('-content').sort({ publishedAt: -1 })
      .skip((page - 1) * limit).limit(parseInt(limit));
    const total = await BlogPost.countDocuments(query);
    res.json({ success: true, posts, pagination: { page: parseInt(page), total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch posts.' });
  }
});

router.get('/posts/:slug', apiLimiter, async (req, res) => {
  try {
    const post = await BlogPost.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } }, { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    const related = await BlogPost.find({ _id: { $ne: post._id }, category: post.category, isPublished: true })
      .select('-content').limit(3);
    res.json({ success: true, post, related });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch post.' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
});

module.exports = router;
