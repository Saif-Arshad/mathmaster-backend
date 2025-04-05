
const db2 = require('../config/db');

class InitialQuiz {
    static async createQuestion({ question_text, option_a, option_b, option_c, option_d, correct_option }) {
        const q = await db2.initial_quiz.create({
            data: { question_text, option_a, option_b, option_c, option_d, correct_option }
        });
        return q.quiz_id;
    }

    static async getAllQuestions() {
        return await db2.initial_quiz.findMany();
    }

    static async getQuestionById(quiz_id) {
        return await db2.initial_quiz.findUnique({ where: { quiz_id: Number(quiz_id) } });
    }

    static async updateQuestion(quiz_id, { question_text, option_a, option_b, option_c, option_d, correct_option }) {
        await db2.initial_quiz.update({
            where: { quiz_id: Number(quiz_id) },
            data: { question_text, option_a, option_b, option_c, option_d, correct_option }
        });
    }

    static async deleteQuestion(quiz_id) {
        await db2.initial_quiz.delete({ where: { quiz_id: Number(quiz_id) } });
    }
}

module.exports = InitialQuiz;
