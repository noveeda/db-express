const express = require("express");
const router = express.Router();
const BoardController = require("../controllers/BoardController");

// 게시글 전체 불러오기
router.get("/posts", BoardController.getPosts);
// 제목이나 작성자로 게시글 조회
router.get("/post", BoardController.getPostsByOption);
// 게시글 에디터 불러오기
// 작성 폼
router.get("/post/editor", BoardController.showPostEditor);
// 특정 게시글 불러오기
router.get("/post/:id", BoardController.getPostByID);
// 수정 폼
router.get("/post/:id/edit", BoardController.showPostEditor);

// 게시글 업로드
router.post("/post", BoardController.submitPost);
// 댓글 작성
router.post("/comment/:postid", BoardController.addComment);
// 댓글 수정
router.post("/comment/:postid/:commentid/edit", BoardController.updateComment);
// 댓글 삭제
router.post(
  "/comment/:postid/:commentid/delete",
  BoardController.deleteComment
);
// 게시글 수정
router.post("/post/:id/edit", BoardController.updatePost);
// 게시글 삭제
router.post("/post/:id/delete", BoardController.deletePost);

module.exports = router;
