const pool = require("../config/db");

/**
 *
 * @param {string} userName 유저 아이디
 * @returns
 */
async function isExistUsername(userName) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = "SELECT * FROM users WHERE user_username = ?";
    const rows = await conn.query(sql, [userName]);
    return rows.length > 0 ? true : false;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

/**
 *
 * @param {Number} userId 유저 id
 * @returns 있으면 true, 없으면 false
 */
async function checkUserByUserId(userId) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = "SELECT COUNT(*) FROM users WHERE user_id = ?";
    const params = [userId];
    const [rows] = await conn.query(sql, params);
    return rows["COUNT(*)"] > 0;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

/**
 *
 * @param {string} username 유저 아이디
 * @param {string} password 유저 비밀번호
 * @param {string} nickname 유저 닉네임
 * @returns
 */
async function createUser(username, password, nickname) {
  let conn;
  try {
    conn = await pool.getConnection();

    // ✅ 중복 확인
    const existingUser = await conn.query(
      "SELECT * FROM users WHERE user_username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return { error: "이미 존재하는 이메일입니다." };
    }

    // ✅ 회원 생성
    const sql =
      "INSERT INTO users (user_username, user_password, user_nickname) VALUES (?, ?, ?)";
    const result = await conn.query(sql, [username, password, nickname]);
    return { user_id: parseInt(result.insertId), username, nickname };
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

/**
 *
 * @param {Number} id userId
 * @returns
 */
async function deleteUser(userId) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = "DELETE FROM users WHERE user_id = ?";
    const params = [userId];
    const result = await conn.query(sql, params);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function getUser(userId) {
  let conn;

  try {
    conn = await pool.getConnection();

    const sql = `
    SELECT * 
    FROM users
    WHERE user_id = ?`;
    const params = [userId];
    const [result] = await conn.query(sql, params);
    return result;
  } catch (error) {
    throw error;
  } finally {
    if (conn) await conn.release();
  }
}

// 로그인
async function validUser(username, password) {
  let conn = await pool.getConnection();
  try {
    const sql = `SELECT 
      user_id id, 
      user_username username,
      user_nickname nickname
      FROM users 
      WHERE user_username = ? AND user_password = ?;`;
    const result = await conn.query(sql, [username, password]);

    // 없으면 false
    if (result.length == 0) {
      return false;
    }

    // 있으면 해당 유저데이터 반환
    return result[0];
  } catch (err) {
    throw err;
  }
}

async function updateUser(nickname, userId) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = `
    UPDATE users
    SET user_nickname = ?
    WHERE user_id = ?;
    `;

    const params = [nickname, userId];
    const result = await conn.query(sql, params);

    return result;
  } catch {
  } finally {
    if (conn) conn.release();
  }
}

module.exports = {
  isExistUsername,
  checkUserByUserId,
  createUser,
  deleteUser,
  validUser,
  getUser,
  updateUser,
};
