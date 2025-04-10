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

function showPostEditor(req, res) {
  try {
    if (!req.session.user) return res.render("signin");

    const error = req.session.error;
    req.session.error = null; // 에러 한 번 보여주면 삭제

    res.render("posteditor", { error });
  } catch (error) {
    throw error;
  }
}

// 만드는 중
async function submitPost(req, res) {
  try {
    let { title, content } = req.body;
    const userId = req.session.user.id; // user_id를 세션에 담음

    console.log(
      `user: ${JSON.stringify(
        req.session.user,
        4,
        null
      )}\ntitle: ${title}\ncontent:${content}`
    );
    //
    if (!title || !content) {
      req.session.error = "제목과 내용을 모두 입력해주세요.";
      return res.redirect("/board/post");
    }

    content = content.replace(/\r?\n/g, "<br>");

    const postId = await BoardModel.createPost(userId, title, content);
    console.log(`postId: ${postId}`);

    res.redirect(`/board/post/${postId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("글 작성 중 오류가 발생했습니다.");
  }
}

// async function getPostByNickname(res, req) {}

module.exports = {
  getPosts,
  getPostByID,
  showPostEditor,
  submitPost,
};
