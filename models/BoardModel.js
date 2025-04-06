const pool = require("../config/db");

async function getPosts(_startPage, _count) {
  let conn;
  const startPage = _startPage || 1;
  const count = _count || 100;
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
    const rows = await conn.query(sql, [count, offset]);
    return JSON.stringify({ startPage, count, data: rows });
  } catch (err) {
    throw err;
  }
}

async function getPostByID(id) {}

module.exports = {
  getPosts,
  getPostByID,
};
