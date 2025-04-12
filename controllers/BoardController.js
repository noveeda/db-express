const BoardModel = require("../models/BoardModel");
const { param } = require("../routes/BoardRoute");

async function getPosts(req, res) {
  try {
    // 시작 페이지
    const startPage = parseInt(req.query.startPage) || 1;
    // 페이지 당 게시물 수
    const count = parseInt(req.query.count) || 10;

    const allowedSortFields = [
      "post_id",
      "post_title",
      "post_date",
      "post_views",
      "user_nickname",
    ];

    const allowedSortOrders = ["asc", "desc"];

    // 정렬 필드
    // 정렬 필드가 없으면 post_id로 설정
    const sortField = allowedSortFields.includes(req.query.sort)
      ? req.query.sort
      : "post_id";

    // 정렬 순서(기본값은 내림차순)
    const sortOrder = allowedSortOrders.includes(req.query.order)
      ? req.query.order
      : "DESC";

    const allowedSearchTypes = ["post_title", "user_nickname"];
    // 검색 기준(기본값은 post_title)
    const searchType = allowedSearchTypes.includes(req.query["search-type"])
      ? req.query["search-type"]
      : "";
    // 검색어
    const keyword = req.query["keyword"] || "";

    // 생각해보니까 length로 구하면 O(1)인데 왜 이렇게 했지?
    const params = {
      startPage: startPage,
      count: count,
      sortField: sortField,
      sortOrder: sortOrder,
      searchType: searchType,
      keyword: keyword,
    };

    // 게시물 가져오기
    const result = await BoardModel.getPosts(params);

    let totalPostsCount;
    if (searchType === "user_nickname" && keyword !== "")
      totalPostsCount = await BoardModel.getPostsCountByNickname(keyword);
    else if (searchType === "post_title" && keyword !== "")
      totalPostsCount = await BoardModel.getPostsCountByTitle(keyword);
    else totalPostsCount = await BoardModel.getPostsCount();

    const totalPages = Math.ceil(totalPostsCount / count);
    const isLogined = req.session.user ? true : false;

    result["totalPages"] = totalPages;
    result["isLogined"] = isLogined;
    // console.log(result);
    res.render("board", result);
    // res.json(result);
  } catch (error) {
    throw error;
  }
}

async function getPostByID(req, res) {
  try {
    const id = parseInt(req.params.id);
    const flag = req.query.flag == "1" ? true : false;

    // 동기 호출로 데이터 보장성 향상.
    // 조회수 증가
    if (!flag) {
      await BoardModel.increasePostViews(id);
    }
    // 게시글 가져오기
    const post = await BoardModel.fetchPostByID(id);
    // 댓글 가져오기
    const comments = await BoardModel.fetchCommentsByPostID(id);
    const isAuthor = req.session.user && req.session.user.id === post.user_id;
    const isCommentAuthor = comments.map((comment) => {
      if (req.session.user && comment.user_id == req.session.user.id) {
        return true;
      }
      return false;
    });
    const result = {
      post,
      comments,
      isAuthor,
      isCommentAuthor,
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
      }
    }
    res.render("posteditor", { error, post });
  } catch (error) {
    res.status(500).send("서버 오류");
  }
}

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

    content = content.replace(/\r?\n/g, "<br>");
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

    // 게시물 삭제
    await BoardModel.deletePost(postId);

    res.redirect("/board/posts"); // 게시글 목록으로 이동
  } catch (err) {
    throw err;
  }
}

async function addComment(req, res) {
  try {
    if (!req.session.user) {
      return res.send(
        `<script>
          alert("로그인이 필요합니다.");
          location.href = "/user/signin";
        </script>`
      );
    }

    const postId = parseInt(req.params.postid);
    const { comment } = req.body;
    const userId = req.session.user.id;

    if (!comment.trim()) {
      return res.send(
        `<script>
          alert("댓글 내용을 입력해주세요."); 
          history.back();
        </script>`
      );
    }

    const result = await BoardModel.insertComment(postId, userId, comment);

    return res.redirect(`/board/post/${postId}?flag=1`); // 게시글 목록으로 이동
  } catch (error) {
    throw error;
  }
}

async function deleteComment(req, res) {
  try {
    const commentId = parseInt(req.params.commentid);
    const postId = parseInt(req.params.postid);
    const userId = req.session.user?.id;

    if (!userId) {
      return res.send(`
        <script>
          alert("로그인 후 시도하세요.");
          history.back();
        </script>`);
    }

    // 본인 댓글인지 확인
    const comment = await BoardModel.fetchCommentByID(commentId, userId);

    if (!comment || comment["user_id"] !== userId) {
      message = "삭제 권한이 없습니다.";
      return res.send(`
          <script>
            alert("${message}"); 
            history.back();
          </script>`);
    }

    // 삭제
    await BoardModel.deleteComment(commentId);

    return res.redirect(`/board/post/${postId}?flag=1`); // 게시글 목록으로 이동
  } catch (error) {
    throw error;
  }
}

async function getPostsByOption(req, res) {
  console.table(req.body);
  console.table(req.params);
  console.table(req.query);
}

async function updateComment(req, res) {
  try {
    const postId = parseInt(req.params.postid);
    const commentId = parseInt(req.params.commentid);
    const commentContent = req.body.comment_content.replace(/\r?\n/g, "<br>");

    // 로그인 확인
    if (!req.session.user) {
      return res.send(`
          <script>
            alert("로그인 후 사용하십시오.");
            location.href="/user/signin";
          </script>
        `);
    }

    // 잘못된 접근 차단
    if (typeof postId !== "number" || typeof commentId !== "number") {
      return res.send(`
          <script>
            alert("올바르지 않은 게시글 번호 또는 댓글 번호입니다.");
            location.href="/board/posts";
          </script>
        `);
    }

    // 댓글의 작성자가 맞는지 확인
    const commentUserId = await BoardModel.getCommentUserId(commentId);

    if (req.session.user.id !== commentUserId) {
      return res.send(`
          <script>
            alert("댓글의 작성자가 아닙니다.");
            history.back();
          </script>
        `);
    }

    const affectedRows = await BoardModel.updateComment(
      commentContent,
      commentId
    );

    if (affectedRows == 0) {
      return res.send(`
          <script>
            alert("없는 댓글입니다.");
            history.back();
          </script>
        `);
    }

    return res.send(`
        <script>
          alert("수정 성공");
          location.href="/board/post/${postId}?flag=1";
        </script>
      `);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getPosts, // 전체 게시물 조회
  getPostByID, // 특정 게시물 조회
  showPostEditor, // 게시글 작성 폼
  submitPost, // 게시글 작성
  updatePost, // 게시글 수정
  deletePost, // 게시글 삭제
  addComment, // 댓글 작성
  deleteComment, // 댓글 삭제
  getPostsByOption, // 제목이나 작성자로 게시글 조회
  updateComment, // 댓글 수정
};
