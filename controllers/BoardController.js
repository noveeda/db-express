const BoardModel = require("../models/BoardModel");
const { post } = require("../routes/BoardRoute");

async function getPosts(req, res) {
  try {
    const startPage = parseInt(req.query.startPage) || 1;
    const count = parseInt(req.query.count) || 10;

    const totalPostsCount = await BoardModel.getPostsCount();
    const totalPages = Math.ceil(totalPostsCount / count);
    const posts = await BoardModel.getPosts(startPage, count);

    result = {
      startPage,
      count,
      totalPages,
      posts: posts,
    };
    // res.json(result);
    res.render("board", result);
  } catch (error) {
    throw error;
  }
}

async function getPostByID(req, res) {
  try {
    const id = parseInt(req.params.id);

    // 기존 코드
    // let result = await BoardModel.getPostByID(id);

    // 동기 호출로 데이터 보장성 향상.
    // 조회수 증가
    await BoardModel.increasePostViews();
    // 게시글 가져오기
    const post = await BoardModel.fetchPostByID(id);
    // 댓글 가져오기
    const comments = await BoardModel.fetchCommentsByPostID(id);

    const result = {
      post,
      comments,
    };

    // res.json(result);
    res.render("post", result);
  } catch (error) {
    throw error;
  }
}

async function getPostByNickname(res, req) {}

module.exports = {
  getPosts,
  getPostByID,
};
