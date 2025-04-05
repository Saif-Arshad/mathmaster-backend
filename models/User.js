
const db = require('../config/db');

class User {
    static async createUser({ email, username, password, age }) {
        const user = await db.users.create({
            data: { email, username, password, age }
        });
        return user.user_id;
    }

    static async findByEmail(email) {
        return await db.users.findUnique({ where: { email } });
    }

    static async findByUsername(username) {
        return await db.users.findUnique({ where: { username } });
    }

    static async findById(user_id) {
        return await db.users.findUnique({ where: { user_id: Number(user_id) } });
    }

    static async blockUser(user_id) {
        await db.users.update({ where: { user_id: Number(user_id) }, data: { is_blocked: true } });
    }

    static async unblockUser(user_id) {
        await db.users.update({ where: { user_id: Number(user_id) }, data: { is_blocked: false } });
    }
}

module.exports = User;