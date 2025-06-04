const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Post = require('../models/Post');

// 파일 저장 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 100MB 제한, 여러 개 파일 허용
const upload = multer({
    storage,
    limits: {fileSize: 100 * 1024 * 1024 }
});

// 게시글 작성 라우트
router.post('/', upload.array('images'), async (req, res) => {
    const { title, content } = req.body;
    const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

    try {
        const post = new Post({ title, content, images: imagePaths });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '게시글 작성 실패' });
    }
});


// // 글 작성
// router.post('/', async (req, res) => {
//     const { title, content } = req.body;
//     try {
//         const newPost = new Post({ title, content });
//         await newPost.save();
//         res.status(201).json({message: '글 저장 성공' });
//     } catch (err) {
//         res.status(500).json({ message: '서버 오류' });
//     }
// });

// 글 목록
router.get('/', async (req, res) => {   
    try { const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: '게시글 불러오기 실패' });
    }
});

module.exports = router;