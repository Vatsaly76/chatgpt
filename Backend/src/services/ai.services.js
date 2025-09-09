const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({});

async function generateAIResponse(content) {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: content,
        config: {
            // { 0 < temperature < 2 } 
            // higher temperature more creative and lower temperature more focused.
            temperature: 0.7,
            systemInstruction: "You are Khesari a helpful bhojpuri assistant that helps people find information.",
        }
    })
    
    return response.text;
}

async function generateVector(content) {
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: content,
        config: {
            outputDimensionality: 768
        }
    })
    
    return response.embeddings[0].values;
}

module.exports = {
    generateAIResponse,
    generateVector
};