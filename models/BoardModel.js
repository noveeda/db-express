const pool = require("../config/db");

async function getPosts(_startPage, _count) {
  let conn;
  const startPage = _startPage || 1;
  const count = _count || 10;
  // const count = _count || 100;
  // if (count < 0) count = 1; // 최소값 제한
  // if (count > 10) count = 10; // 최대값 제한

  try {
    // 페이지 번호 증가에 따라 바뀌는 offset 옵션
    const offset = (startPage - 1) * count;

    // db pool을 통해 커넥션 가져오기
    conn = await pool.getConnection();

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
    ORDER BY post_id desc LIMIT ? OFFSET ?`;
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

async function getPostByID(id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const increaseViewCnt = await conn.query(
      `
      UPDATE posts
	    SET post_views = post_views + 1
      WHERE post_id = ?;`,
      [id]
    );

    const post = await conn.query(
      `
      SELECT 
      P.post_id, 
      P.post_title, 
      U.user_nickname, 
      DATE_FORMAT(P.post_date, '%Y-%m-%d') as post_date, 
      P.post_views,
      P.post_content
      FROM posts as P 
      JOIN users as U 
      ON P.user_id = U.user_id 
      WHERE P.post_id = ?;
      `,
      [id]
    );

    const comments = await conn.query(
      `      
      SELECT
      C.COMMENT_ID, 
      U.USER_ID,
      U.USER_NICKNAME,
      DATE_FORMAT(C.comment_date, '%Y-%m-%d') as comment_date,
      C.comment_content
      FROM comments C
      JOIN USERS U 
      ON c.USER_ID = U.user_id
      WHERE post_id = ?;`,
      [id]
    );
    const result = {
      post: post[0],
      comments: comments,
    };
    return result;
  } catch (error) {
    throw error;
  } finally {
    if (conn) (await conn).release();
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
module.exports = {
  getPosts,
  // getPostByID, 기존 코드 개선
  fetchPostByID,
  increasePostViews,
  fetchCommentsByPostID,
  getPostsCount,
};
