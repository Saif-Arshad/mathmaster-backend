function buildSortingPrompt(questions, progress) {
    const slimQuestions = questions.map(q => ({
        questionId: q.question_id,
        question: q.question_text,
        gameLabel: q.game
    }));
    const messages = [
        {
            role: "system",
            content:
                "You are an AI assistant that organises math questions for dyslexic children. " +
                "Sort the questions from easiest to hardest, taking the learner’s progress into account, " +
                "and assign an appropriate gameType (ColorUp, Sort, Box, or Equation)."
        },
        {
            role: "system",
            content:
                "⚠️  Output ONLY a valid JSON array. " +
                "Do NOT wrap the response in markdown, back‑ticks, or extra text. " +
                "Every element must have: questionId, question, difficulty (1‑10), gameType, sortOrder."
        },
        {
            role: "user",
            content:
                `User progress: ${progress}%\n\n` +
                "Here are the questions you need to sort (id, prompt & original game label):\n" +
                JSON.stringify(slimQuestions) + "\n\n" +
                "Example format (single element):\n" +
                '[{"questionId":1,"question":"2+2","difficulty":1,"gameType":"ColorUp","sortOrder":1}]\n\n' +
                "Return the full sorted list now."
        }
    ];

    return messages;
}

const axios = require("axios");
require("dotenv").config();

exports.generateLearning = async (questions, progress) => {
    if (!questions)
        throw new Error("Both questions and progress are required.");
    let mainProgress = progress ? progress : 0
    const messages = buildSortingPrompt(questions, mainProgress);

    const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
            model: "gpt-3.5-turbo",
            max_tokens: 1000,
            temperature: 0.3,
            messages
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPEN_API}`
            }
        }
    );

    let content = response.data.choices?.[0]?.message?.content?.trim() ?? "";

    content = content.replace(/^```[a-z]*\s*/, "").replace(/\s*```$/, "");

    const lastBracketIndex = content.lastIndexOf("]");
    if (lastBracketIndex !== -1) {
        content = content.substring(0, lastBracketIndex + 1);
    }

    let parsed;
    try {
        parsed = JSON.parse(content);
    } catch (e) {
        console.error("Error parsing JSON:", e.message);
        throw new Error("Failed to parse JSON from OpenAI API response.");
    }

    if (Array.isArray(parsed)) {
        return parsed;
    } else if (parsed && parsed.questions) {
        return parsed.questions;
    } else {
        throw new Error("Unexpected JSON format from API.");
    }
};
