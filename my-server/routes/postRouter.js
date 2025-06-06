const express = require('express');
const router = express.Router();
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
// const fs = require('fs');  // 파일 시스템 모듈
// const path = require('path');
const Post = require('../models/Post');

// Cloudinary 환경변수 설정
cloudinary.config({
    cloud_name: 'dhdt9ev5k',
    api_key: '486822561298586',
    api_secret: 'K01vEA5ZbDGC77MmyM9PTs62EBM'
});

// Cloudinary용 multer storage 설정
const cloudStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'webtoon_uploads', // Cloudinary 내 폴더명
        allowed_formats: ['jpg', 'png'],
        transformation: [{width: 800, height: 800, crop: 'limit' }]
    }
});

// 업로드 미들웨어
const upload = multer({
    storage: cloudStorage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png'];
        if(allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('허용되지 않는 파일 형식입니다.'));
        }
    }
});

// 게시글 작성
router.post('/', upload.array('images'), async (req, res) => {
    const { title, content } = req.body;
    const imagePaths = req.files.map(file => file.path); // Cloudinary URL
    console.log(imagePaths);
    try {
        const post = new Post({ title, content, images: imagePaths });
        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '게시글 작성 실패' });
    }
});

// 게시글 목록
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: '게시글 불러오기 실패' });
    }
});


// 게시글 삭제
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: '게시글이 존재하지 않습니다.' });

        // 이미지가 있다면 삭제 시도
        if (post.images && post.images.length > 0) {
            for (const url of post.images) {
                const match = url.match(/\/upload\/(?:v\d+\/)?([^\.\/]+)\./); // public_id 추출
                if (match && match[1]) {
                    const publicId = `webtoon_uploads/${match[1]}`;
                    try {
                        await cloudinary.uploader.destroy(publicId);
                    } catch (err) {
                        console.warn(`Cloudinary 이미지 삭제 실패 (무시): ${publicId}`, err.message);
                        // 실패하더라도 게시글 삭제는 계속 진행
                    }
                }
            }
        }

        await post.deleteOne();
        res.json({ message: '게시글 및 이미지 삭제 완료'});
    } catch (err) {
        console.error('삭제 중 에러:', err);
        res.status(500).json({ message: '서버 에러로 삭제 실패'});
    }
});

module.exports = router;

// // 게시글 삭제 
// router.delete('/:id', async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id);
//         if(!post) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.'});

//         // 이미지들 삭제
//         for (const imagePath of post.images) {
//             if (imagePath.startsWith('https://res.cloudinary.com/')) {
//                 // Cloudinary 이미지
//                 const publicId = imagePath.split('/').slice(-2).join('/').split('.')[0]; // 예: webtoon_uploads/abcd1234
//                 await cloudinary.uploader.destroy(publicId);
//             } else if (imagePath.startsWith('/uploads/')) {
//                 // 로컬 이미지
//                 const localPath = path.join(__dirname, '..', imagePath);
//                 fs.unlink(localPath, err => {
//                     if (err) console.error('로컬 파일 삭제 실패:', err);
//                 });
//             }
//         }

//         // 게시글 삭제
//         await Post.findByIdAndDelete(req.params.id);

//         res.json({ message: '게시글과 이미지가 성공적으로 삭제되었습니다.' });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: '게시글 삭제 중 오류 발생' });
//     }
// });


// module.exports = router;

// // uploads 경로 설정
// const uploadPath = path.join(__dirname, '..', 'uploads');

// // 폴더 없으면 생성
// if (!fs.existsSync(uploadPath)) {
//     fs.mkdirSync(uploadPath, { recursive: true });
// }

// // 파일 저장 설정
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => cb(null, 'uploads/'),
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     }
// });

// // 100MB 제한, 여러 개 파일 허용
// const upload = multer({
//     storage,
//     limits: {fileSize: 100 * 1024 * 1024 },
//     fileFilter: (req, file, cb) => {
//         const allowedTypes = ['image/jpeg', 'image/png'];
//         if (allowedTypes.includes(file.mimetype)) {
//             cb(null, true);
//         } else {
//             cb(new Error('허용되지 않는 파일 형식입니다.'));
//         }
//     }
// });

// // 게시글 작성 라우트
// router.post('/', upload.array('images'), async (req, res) => {
//     const { title, content } = req.body;
//     const imagePaths = req.files.map(file => `/uploads/${file.filename}`);

//     try {
//         const post = new Post({ title, content, images: imagePaths });
//         await post.save();
//         res.status(201).json(post);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: '게시글 작성 실패' });
//     }
// });


// // // 글 작성
// // router.post('/', async (req, res) => {
// //     const { title, content } = req.body;
// //     try {
// //         const newPost = new Post({ title, content });
// //         await newPost.save();
// //         res.status(201).json({message: '글 저장 성공' });
// //     } catch (err) {
// //         res.status(500).json({ message: '서버 오류' });
// //     }
// // });

// // 글 목록
// router.get('/', async (req, res) => {   
//     try { const posts = await Post.find().sort({ createdAt: -1 });
//         res.json(posts);
//     } catch (err) {
//         res.status(500).json({ message: '게시글 불러오기 실패' });
//     }
// });

// module.exports = router;