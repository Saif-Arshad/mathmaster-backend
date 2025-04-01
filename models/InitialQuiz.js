const db = require('../config/db');

class InitialQuiz {
    static async createQuestion({ question_text, option_a, option_b, option_c, option_d, correct_option }) {
        const [result] = await db.query(
            `INSERT INTO initial_quiz (question_text, option_a, option_b, option_c, option_d, correct_option)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [question_text, option_a, option_b, option_c, option_d, correct_option]
        );
        return result.insertId;
    }

    static async getAllQuestions() {
        const [rows] = await db.query('SELECT * FROM initial_quiz');
        return rows;
    }

    static async getQuestionById(quiz_id) {
        const [rows] = await db.query('SELECT * FROM initial_quiz WHERE quiz_id = ?', [quiz_id]);
        return rows[0];
    }

    static async updateQuestion(quiz_id, { question_text, option_a, option_b, option_c, option_d, correct_option }) {
        await db.query(
            `UPDATE initial_quiz
       SET question_text = ?, option_a = ?, option_b = ?, option_c = ?, option_d = ?, correct_option = ?
       WHERE quiz_id = ?`,
            [question_text, option_a, option_b, option_c, option_d, correct_option, quiz_id]
        );
    }

    static async deleteQuestion(quiz_id) {
        await db.query('DELETE FROM initial_quiz WHERE quiz_id = ?', [quiz_id]);
    }
}

module.exports = InitialQuiz;
