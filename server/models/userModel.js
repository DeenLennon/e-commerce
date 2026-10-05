const pool = require("../config/db");

const createUser = async ({
  first_name,
  last_name,
  email,
  password_hash,
  phone,
}) => {
  const [result] = await pool.query(
    `
    INSERT INTO users
      (first_name, last_name, email, password_hash, phone)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      first_name,
      last_name,
      email,
      password_hash,
      phone || null,
    ]
  );

  return result.insertId;
};

const findUserByEmail = async (email) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      email,
      password_hash,
      phone,
      role,
      status,
      created_at,
      updated_at
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await pool.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      email,
      phone,
      role,
      status,
      created_at,
      updated_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0] || null;
};

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
};