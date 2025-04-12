const pool = require("../config/db");

// 페이지네이션 한 포스트 가져오기
async function getPosts(params) {
  let conn;
  let { startPage, count, sortField, sortOrder, searchType, keyword } = params;

  try {
    // db pool을 통해 커넥션 가져오기
    conn = await pool.getConnection();

    /*
    SELECT [DISTINCT] column1, column2, ...
    FROM table_name
    [JOIN ...]
    [WHERE 조건]
    [GROUP BY column]
    [HAVING 조건]
    [WINDOW ...]
    [ORDER BY column [ASC|DESC]]
    [LIMIT n OFFSET m] -- 또는 FETCH FIRST n ROWS ONLY
    [UNION / UNION ALL ...]
    */
    // 기본 쿼리
    let sql =
      "SELECT P.post_id, P.post_title, U.user_nickname, DATE_FORMAT(P.post_date, '%Y-%m-%d') as post_date, P.post_views ";
    sql += "FROM posts as P ";
    sql += "JOIN users as U ON P.user_id = U.user_id ";

    // 검색 기능 추가
    if (params["searchType"] !== "" && params["keyword"] !== "") {
      // WHERE searchType LIKE %keyword%
      sql += "WHERE " + searchType + " LIKE '%" + keyword + "%' ";
    }

    sql += `ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ? `;

    // 페이지네이션을 위한 파라미터 설정
    // startPage는 1부터 시작하므로 -1을 해준다.

    offset = (startPage - 1) * count;

    const posts = await conn.query(sql, [count, offset]);

    const result = {
      startPage: startPage,
      count: count,
      sortField: sortField,
      sortOrder: sortOrder,
      searchType: searchType,
      keyword: keyword,
      posts: posts,
    };

    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

// Post 전체 개수
async function getPostsCount() {
  let conn;
  try {
    conn = await pool.getConnection();

    // o(n)
    let sql = "SELECT count(*) as count FROM posts";

    const rows = await conn.query(sql);
    return Number(rows[0].count); // BigInt -> Number로 형변환.
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function getPostsCountByTitle(title) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = `SELECT COUNT(*) as count FROM posts WHERE post_title LIKE '%${title}%'`;
    const result = await conn.query(sql);

    return Number(result[0]["count"]);
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function getPostsCountByNickname(nickname) {
  let conn;
  try {
    conn = await pool.getConnection();

    const sql = `
    SELECT COUNT(*) count 
    FROM posts P
    JOIN users U ON P.user_id = U.user_id
    WHERE user_nickname LIKE '%${nickname}%'`;
    const result = await conn.query(sql);
    console.log(result);
    return Number(result[0]["count"]);
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

// 조회수 증가
async function increasePostViews(id) {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.query(
      `UPDATE posts SET post_views = post_views + 1 WHERE post_id = ?`,
      [id]
    );
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

// 게시글 조회 함수
async function fetchPostByID(id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const post = await conn.query(
      `SELECT 
        P.post_id, 
        P.post_title, 
        U.user_nickname, 
        U.user_id,
        DATE_FORMAT(P.post_date, '%Y-%m-%d') as post_date, 
        P.post_views,
        P.post_content
      FROM posts AS P
      JOIN users AS U ON P.user_id = U.user_id
      WHERE P.post_id = ?`,
      [id]
    );
    return post[0];
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

// 댓글 조회 함수
async function fetchCommentsByPostID(id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const comments = await conn.query(
      `SELECT
        C.comment_id, 
        U.user_id,
        U.user_nickname,
        DATE_FORMAT(C.comment_date, '%Y-%m-%d') as comment_date,
        C.comment_content
      FROM comments AS C
      JOIN users AS U ON C.user_id = U.user_id
      WHERE C.post_id = ?
      ORDER BY C.comment_id DESC`,
      [id]
    );
    return comments;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function createPost(userId, title, content) {
  let conn;
  try {
    conn = await pool.getConnection();

    const sql = `
      INSERT INTO posts (user_id, post_title, post_content, post_date, post_views)
      VALUES (?, ?, ?, CURDATE(), 0)
    `;

    const result = await conn.query(sql, [userId, title, content]);

    return Number(result.insertId);
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function updatePost(postId, title, content) {
  let conn;
  try {
    conn = await pool.getConnection();

    const sql = `
      UPDATE posts
      SET post_title = ?, post_content = ?
      WHERE post_id = ?;
    `;

    const result = await conn.query(sql, [title, content, postId]);

    return Number(result.affectedRows);
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function deletePost(postId) {
  let conn;
  try {
    conn = await pool.getConnection();

    // 댓글 먼저 삭제
    // Big-O(log N)
    let sql = `DELETE FROM comments WHERE post_id = ?`;
    await conn.query(sql, [postId]);

    // 이어서 게시물 삭제
    // Big-O(log N)
    sql = `DELETE FROM posts WHERE post_id = ?`;
    const result = await conn.query(sql, [postId]);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function insertComment(postId, userId, comment) {
  let conn;
  try {
    // console.log(`insertComment: ${postId}, ${userId}, ${comment}`);
    conn = await pool.getConnection();
    const sql = `
      INSERT INTO comments (post_id, user_id, comment_content, comment_date)
      VALUES (?, ?, ?, NOW())
    `;
    const result = await conn.query(sql, [postId, userId, comment]);

    return result;
  } catch (error) {
  } finally {
    if (conn) conn.release();
  }
}

async function fetchCommentByID(commentId, userId) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = `
      SELECT comment_id, user_id
      FROM comments
      WHERE comment_id = ? AND user_id = ?;
    `;

    // 첫번째 배열 반환
    const [result] = await conn.query(sql, [commentId, userId]);

    return result;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function deleteComment(commentId) {
  let conn;
  try {
    conn = await pool.getConnection();

    const sql = `DELETE FROM comments WHERE comment_id = ?`;
    const result = await conn.query(sql, [commentId]);
    return result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

async function getPostsByUserId(userId) {
  let conn;
  try {
    conn = await pool.getConnection();
    // 번호 제목 조회수 수정 삭제
    const sql = `
    SELECT 
    post_id,
    post_title,
    post_views,
    post_date
    FROM posts
    WHERE user_id = ?
    ORDER BY post_id;
    `;
    const params = [userId];
    const result = await conn.query(sql, params);

    return result;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function deletePostsByUserId(userId) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = `
    DELETE FROM posts WHERE user_id = ?;`;
    const params = [userId];

    const result = conn.query(sql, params);
    return result ? true : false;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

//
async function deleteCommentsByUserId(userId) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = `
    DELETE FROM comments WHERE user_id = ?;`;
    const params = [userId];

    const result = conn.query(sql, params);
    return result ? true : false;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

/**
 *
 * @param {Number} commentId
 * @returns 댓글의 user_id를 반환
 */
async function getCommentUserId(commentId) {
  let conn;

  try {
    // Big-O(log N)
    conn = await pool.getConnection();

    const sql = `
      SELECT user_id
      FROM comments
      WHERE comment_id = ?;
    `;

    const params = [commentId];

    const [result] = await conn.query(sql, params);

    return result["user_id"];
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function updateComment(commentContent, commendId) {
  let conn;
  try {
    // 커넥션을 가져온다.
    conn = await pool.getConnection();

    // Big-O(log N)
    const sql = `
      UPDATE comments
      SET
        comment_content = ?,
        comment_date = CURDATE()
      WHERE comment_id = ?;
    `;

    // ?에 들어갈 값들
    const params = [commentContent, commendId];

    // 쿼리 실행
    const result = await conn.query(sql, params);

    // Update된 Rows의 개수를 반환
    return Number(result.affectedRows);
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  getPosts, // 전체 게시물 조회
  fetchPostByID, // PostID 게시물 조회
  increasePostViews, // 게시물 조회수 증가
  fetchCommentsByPostID, // 게시물 댓글 조회
  getPostsCount, // 총 게시물 개수 조회
  createPost, // 게시물 작성
  updatePost, // 게시물 수정
  deletePost, // 게시물 삭제
  insertComment, // 댓글 추가
  fetchCommentByID, // 댓글 조회
  deleteComment, // 댓글 1개 삭제
  getPostsByUserId, // 사용자가 작성한 게시물 조회
  deletePostsByUserId, // 사용자의 게시글 전체 삭제
  deleteCommentsByUserId, // 사용자의 댓글 전체 삭제
  updateComment, // 댓글 수정
  getCommentUserId, // 특정 댓글의 user_id를 조회
  getPostsCountByTitle, // 제목으로 게시물 개수 조회
  getPostsCountByNickname, // 작성자로 게시물 개수 조회
};
