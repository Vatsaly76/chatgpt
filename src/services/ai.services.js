const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateAIResponse(prompt) {
    const model = ai.getGenerativeModel({ model: "gemini-2.0" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}


module.exports = {
    generateAIResponse
};