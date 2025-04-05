const db = require('../config/db'); 
class InitialQuiz {
    static async createQuestion(data) {
        const q = await db.initial_quiz.create({ data });
        return q.quiz_id;
    }

    static async getAllQuestions() {
        return await db.initial_quiz.findMany();
    }

    static async getQuestionById(quiz_id) {
        return await db.initial_quiz.findUnique({
            where: { quiz_id: Number(quiz_id) }
        });
    }

    static async updateQuestion(quiz_id, data) {
        await db.initial_quiz.update({
            where: { quiz_id: Number(quiz_id) },
            data
        });
    }

    static async deleteQuestion(quiz_id) {
        await db.initial_quiz.delete({
            where: { quiz_id: Number(quiz_id) }
        });
    }
}

module.exports = InitialQuiz;
