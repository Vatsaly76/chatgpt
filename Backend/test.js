require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY.replace(/^Bearer\s+/i, '').trim(),
    baseURL: 'https://integrate.api.nvidia.com/v1'
});
openai.chat.completions.create({
    model: 'google/gemma-2-2b-it',
    messages: [
        {role: 'user', content: 'You are helpful'},
        {role: 'assistant', content: 'Ok'},
        {role: 'user', content: 'who is Nolan'}
    ]
}).then(c => console.log(c.choices[0].message)).catch(console.error);
