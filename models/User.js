const db = require('../config/db');

class User {
    static async createUser({ email, username, password, age }) {
        const [rows] = await db.query(
            `INSERT INTO users (email, username, password, age) VALUES (?,?,?,?)`,
            [email, username, password, age]
        );
        return rows.insertId; 
    }

    static async findByEmail(email) {
        const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [email]);
        return rows[0];
    }

    static async findByUsername(username) {
        const [rows] = await db.query(`SELECT * FROM users WHERE username = ?`, [username]);
        return rows[0];
    }

    static async findById(user_id) {
        const [rows] = await db.query(`SELECT * FROM users WHERE user_id = ?`, [user_id]);
        return rows[0];
    }

  

    static async blockUser(user_id) {
        await db.query(`UPDATE users SET is_blocked = 1 WHERE user_id = ?`, [user_id]);
    }

    static async unblockUser(user_id) {
        await db.query(`UPDATE users SET is_blocked = 0 WHERE user_id = ?`, [user_id]);
    }
}

module.exports = User;
