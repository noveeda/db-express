const pool = require("../config/db");

// 페이지네이션 한 포스트 가져오기
async function getPosts(_startPage, _count, _sortField, _sortOrder) {
  let conn;
  const startPage = _startPage || 1;
  const count = _count || 10;

  try {
    // 페이지 번호 증가에 따라 바뀌는 offset 옵션
    const offset = (startPage - 1) * count;

    // db pool을 통해 커넥션 가져오기
    conn = await pool.getConnection();

    const allowedSortFields = [
      "post_id",
      "post_title",
      "post_date",
      "post_views",
      "user_nickname",
    ];
    const sortField = allowedSortFields.includes(_sortField)
      ? _sortField
      : "post_id";
    const sortOrder = _sortOrder === "desc" ? "DESC" : "ASC";

    const sql = `
    SELECT 
    P.post_id, 
    P.post_title, 
    U.user_nickname, 
    DATE_FORMAT(P.post_date, '%Y-%m-%d') as post_date, 
    P.post_views
    FROM posts as P 
    JOIN users as U 
    ON P.user_id = U.user_id 
    ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
    /**
     * 테이블 posts 에서
     * OFFSET 에서부터
     * LIMIT개 만큼
     * 모든(*) 컬럼을
     * 조회(select)하겠다.
     */
    const result = await conn.query(sql, [count, offset]);

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
    const sql = `SELECT count(*) as count FROM posts;`;
    const rows = await conn.query(sql);
    return Number(rows[0].count); // BigInt -> Number로 형변환.
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
    const sql = `DELETE FROM posts WHERE post_id = ?`;
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
  deleteComment, // 댓글 삭제
  getPostsByUserId, // 사용자가 작성한 게시물 조회
  deletePostsByUserId, // 사용자의 게시글 삭제
  deleteCommentsByUserId, // 사용자의
};
