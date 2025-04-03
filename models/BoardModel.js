const pool = require("../config/db");

async function getPosts() {
  let conn;

  try {
    // 페이지 번호 옵션
    const page = parseInt(req.query.startPage) || 1;
    // 페이지 당 데이터 개수 옵션
    const limit = parseInt(req.query.listCel) || 10;
    // 페이지 번호 증가에 따라 바뀌는 offset 옵션
    const offset = (page - 1) * limit;

    // db pool을 통해 커넥션 가져오기
    conn = await pool.getConnection();

    const sql = "SELECT * FROM dummy_posts LIMIT ? OFFSET ?";
    /**
     * 테이블 dummy_posts 에서
     * OFFSET 위치에서
     * LIMIT개 만큼
     * 모든(*) 컬럼을
     * 조회(select)하겠다.
     */
    const rows = await conn.query(sql, [limit, offset]);
    res.json({ page, limit, data: rows });
  } catch (err) {
    throw err;
  }
}

async function getPostByID(id) {}

module.exports = {
  getPosts,
  getPostByID,
};
