const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// 글 작성
router.post('/', async (req, res) => {
    const { title, content } = req.body;
    try {
        const newPost = new Post({ title, content });
        await newPost.save();
        res.status(201).json({message: '글 저장 성공' });
    } catch (err) {
        res.status(500).json({ message: '서버 오류' });
    }
});

// 글 목록
router.get('/', async (req, res) => {   
    try { const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: '게시글 불러오기 실패' });
    }
});

module.exports = router;