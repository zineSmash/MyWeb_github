// index.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(express.json()); // JSON 요청 처리 가능하게 해줌
app.use(cors());

// 메모리에 글 저장
let posts = [];

// 글 목록 조회
app.get('/posts', (req, res) => {
    res.json(posts);
});

// 글 등록
app.post('/posts', (req, res) => {
    const { title, content } = req.body;

    if(!title || !content) {
        return res.status(400).json({ message: '제목과 내용을 모두 입력하세요.' });
    }

    const newPost = {
        id: posts.length +1,
        title,
        content,
        createdAt: new Date()
    };

    posts.push(newPost);
    res.status(201).json(newPost);
});

// 기본 라우트 (루트 경로)
app.get('/', (req, res) => {
    res.send('서버가 잘 작동합니다.');
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});