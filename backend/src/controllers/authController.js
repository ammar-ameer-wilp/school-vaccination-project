const pool = require('../db');

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (!user.rows.length) {
      return res.status(401).json({ status: 'nok', message: 'Invalid username or password' });
    }

    const admin = user.rows[0];
    const isMatch = password === admin.password;

    if (!isMatch) {
      return res.status(401).json({ status: 'nok', message: 'Invalid password' });
    }

    res.status(200).json({
      status: 'ok',
      message: 'login success',
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'nok', message: 'Internal server error' });
  }
};

const createUser = async (req, res) => {
  const { username, password, role = 'coordinator' } = req.body;

  if (!username || !password) {
    return res.status(400).json({ status: 'nok', message: 'Username/password missing' });
  }
  try {
    const checkUser = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (checkUser.rows.length) {
      return res.status(409).json({ status: 'nok', message: 'Username already exists' });
    }

    const user = await pool.query(
      'INSERT INTO users(username, password, role) VALUES($1, $2, $3) RETURNING id',
      [username, password, role]
    );

    res.status(201).json({
      status: 'ok',
      message: 'User created successfully',
      user: {
        id: user.rows[0].id,
        username,
        role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ status: 'nok', message: 'Internal server error' });
  }
};

module.exports = { login, createUser };
