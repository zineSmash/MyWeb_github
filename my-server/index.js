// index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const postRouter = require('./routes/postRouter');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(express.json()); // JSON 요청 처리 가능하게 해줌
app.use(cors());
app.use('/posts', postRouter);
app.use('/uploads', express.static('uploads'));

// // 메모리에 글 저장
// let posts = [];

// // 글 목록 조회
// app.get('/posts', (req, res) => {
//     res.json(posts);
// });

// // 글 등록
// app.post('/posts', (req, res) => {
//     const { title, content } = req.body;

//     if(!title || !content) {
//         return res.status(400).json({ message: '제목과 내용을 모두 입력하세요.' });
//     }

//     const newPost = {
//         id: posts.length +1,
//         title,
//         content,
//         createdAt: new Date()
//     };

//     posts.push(newPost);
//     res.status(201).json(newPost);
// });

// 기본 라우트 (루트 경로)
app.get('/', (req, res) => {
    res.send('서버가 잘 작동합니다.');
});

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('MongoDB 연결 성공');
    app.listen(PORT, () => console.log(`서버 실행: http://localhost:${PORT}`));
})
.catch(err => console.error('MongoDB 연결 실패: ', err));

// // 서버 시작
// app.listen(PORT, () => {
//     console.log(`서버 실행 중: http://localhost:${PORT}`);
// });