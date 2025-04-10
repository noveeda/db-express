const { Model } = require("sequelize");
const BoardModel = require("../models/BoardModel");
const { post } = require("../routes/BoardRoute");
const alertAndBack = require("../utils/AlertAndBack");

async function getPosts(req, res) {
  try {
    const startPage = parseInt(req.query.startPage) || 1;
    const count = parseInt(req.query.count) || 10;
    const sortField = req.query.sort || "post_id";
    const sortOrder = req.query.order || "desc";

    const totalPostsCount = await BoardModel.getPostsCount();
    const totalPages = Math.ceil(totalPostsCount / count);
    const posts = await BoardModel.getPosts(
      startPage,
      count,
      sortField,
      sortOrder
    );

    result = {
      startPage,
      count,
      totalPages,
      posts: posts,
      sortField: sortField,
      sortOrder: sortOrder,
    };
    res.render("board", result);
    // res.json(result);
  } catch (error) {
    throw error;
  }
}

async function getPostByID(req, res) {
  try {
    const id = parseInt(req.params.id);

    // 동기 호출로 데이터 보장성 향상.
    // 조회수 증가
    await BoardModel.increasePostViews(id);
    // 게시글 가져오기
    const post = await BoardModel.fetchPostByID(id);
    // 댓글 가져오기
    const comments = await BoardModel.fetchCommentsByPostID(id);
    const isAuthor = req.session.user && req.session.user.id === post.user_id;

    const result = {
      post,
      comments,
      isAuthor,
    };

    // res.json(result);
    res.render("post", result);
  } catch (error) {
    throw error;
  }
}

async function showPostEditor(req, res) {
  try {
    // 로그인 안됐으면 로그인 페이지로
    if (!req.session.user) return res.render("signin");

    // 업로드할때 미입력 데이터 있을 때 띄울 에러 메시지
    let error = req.session.error;
    req.session.error = null;

    // 수정할 포스트 id
    const postId = req.params.id;
    let post = null;

    // 수정할 포스트 id가 있으면 게시글 불러오기
    if (postId) {
      post = await BoardModel.fetchPostByID(postId);

      if (!post || post.user_id !== req.session.user.id) {
        error = "수정 권한이 없습니다.";
        res.redirect("/board/posts");
      } else {
        res.render("posteditor", { error, post });
      }
    }
  } catch (error) {
    res.status(500).send("서버 오류");
  }
}

// 만드는 중
async function submitPost(req, res) {
  try {
    let { title, content } = req.body;
    const userId = req.session.user.id; // user_id를 세션에 담음
    //
    if (!title || !content) {
      req.session.error = "제목과 내용을 모두 입력해주세요.";
      return res.redirect("/board/post");
    }

    content = content.replace(/\r?\n/g, "<br>");

    const postId = await BoardModel.createPost(userId, title, content);

    res.redirect(`/board/post/${postId}`);
  } catch (err) {
    res.status(500).send("글 작성 중 오류가 발생했습니다.");
  }
}

async function updatePost(req, res) {
  try {
    let postId = parseInt(req.params.id);
    let { title, content } = req.body;

    let updatePost = await BoardModel.updatePost(postId, title, content);

    // res.json(updatePost);
    res.redirect(`/board/post/${postId}`);
  } catch (err) {
    res.status(500).send("글 작성 중 오류가 발생했습니다.");
  }
}

async function deletePost(req, res) {
  try {
    const postId = req.params.id;
    const userId = req.session.user?.id;

    // 로그인 체크
    if (!userId) {
      return res.render("signin");
    }

    // 해당 게시글이 본인 글인지 확인
    const post = await BoardModel.fetchPostByID(postId);
    if (!post || post.user_id !== userId) {
      message = "삭제 권한이 없습니다.";
      return res
        .status(403)
        .send(`<script>alert("${message}"); history.back();</script>`);
    }

    // 삭제
    await BoardModel.deletePost(postId);

    res.redirect("/board/posts"); // 게시글 목록으로 이동
  } catch (err) {
    console.error(err);
    res.status(500).send("서버 에러");
  }
}

module.exports = {
  getPosts,
  getPostByID,
  showPostEditor,
  submitPost,
  updatePost,
  deletePost,
};
