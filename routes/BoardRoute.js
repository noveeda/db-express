const express = require("express");
const router = express.Router();
const BoardController = require("../controllers/BoardController");

// 게시글 전체 불러오기
router.get("/posts", BoardController.getPosts);
// 게시글 에디터 불러오기
// 작성 폼
router.get("/post", BoardController.showPostEditor);
// 특정 게시글 불러오기
router.get("/post/:id", BoardController.getPostByID);
// 수정 폼
router.get("/post/:id/edit", BoardController.showPostEditor);

// 게시글 업로드
router.post("/post", BoardController.submitPost);
// 게시글 수정
router.post("/post/:id/edit", BoardController.updatePost);
// 게시글 삭제
router.post("/post/:id/delete", BoardController.deletePost);

module.exports = router;
