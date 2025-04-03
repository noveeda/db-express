const pool = require("../config/db");

async function getAllUsers() {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = "SELECT * FROM users";
    const rows = await conn.query();
    return rows;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function getUserByUsername(userName) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = "SELECT * FROM users WHERE id = ?";
    const rows = await conn.query(sql, [userName]);
    return rows.length ? rows[0] : null;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function createUser(username, password, nickname) {
  let conn;
  try {
    conn = await pool.getConnection();

    // ✅ 중복 확인
    const existingUser = await conn.query(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    if (existingUser.length > 0) {
      return { error: "이미 존재하는 이메일입니다." };
    }

    // ✅ 회원 생성
    const sql =
      "INSERT INTO users (user_username, user_password, user_nickname) VALUES (?, ?, ?)";
    const result = await conn.query(sql, [username, password, nickname]);
    return { user_id: result.insertId, username, nickname };
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

async function deleteUser(id) {
  let conn;
  try {
    conn = await pool.getConnection();
    const sql = "DELETE FROM users WHERE id = ?";
    const result = await conn.query(sql, [id]);
    return result.affectedRows > 0;
  } catch (error) {
    throw error;
  } finally {
    if (conn) conn.release();
  }
}

// 로그인
async function validUser(username, password) {
  let conn = await pool.getConnection();
  try {
    const sql =
      "SELECT COUNT(*) FROM users WHERE user_username = ? AND user_password = ?;";
    const result = await conn.query(sql, [username, password]);

    // 로그인 실패
    if (result.length === 0) {
      return false;
    }

    // 로그인 성공
    return true;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  getAllUsers,
  getUserByUsername,
  createUser,
  deleteUser,
  validUser,
};
